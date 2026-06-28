import os
import json
import base64
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, UserModel

SUPABASE_URL        = os.getenv("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

bearer_scheme = HTTPBearer()


def _b64_decode(s: str) -> bytes:
    """Base64url decode with padding fix."""
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)


def _get_payload_unverified(token: str) -> dict:
    """Decode JWT payload without signature verification."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Not a valid JWT")
        return json.loads(_b64_decode(parts[1]))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Malformed token: {e}")


def _verify_with_supabase(token: str) -> dict:
    """
    Verify token by calling Supabase's /auth/v1/user endpoint.
    Supabase validates the token server-side — no algorithm issues.
    """
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="SUPABASE_URL not configured.")

    try:
        resp = httpx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": os.getenv("SUPABASE_ANON_KEY", ""),
            },
            timeout=10,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification request failed: {e}")

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    return resp.json()   # returns Supabase user object


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    token = credentials.credentials

    # Verify token via Supabase — handles HS256, RS256, anything
    supabase_user = _verify_with_supabase(token)

    user_id = supabase_user.get("id")
    email   = supabase_user.get("email", "")
    name    = (supabase_user.get("user_metadata") or {}).get("full_name") or email.split("@")[0]

    if not user_id:
        raise HTTPException(status_code=401, detail="Could not identify user.")

    # Auto-create user row on first login
    user = db.query(UserModel).filter_by(id=user_id).first()
    if not user:
        user = UserModel(id=user_id, name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user