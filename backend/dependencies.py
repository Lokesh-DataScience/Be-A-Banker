import os
import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, UserModel

# ── Supabase config ───────────────────────────────────────────────────────────
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL        = os.getenv("SUPABASE_URL", "")
# JWKS endpoint for RS256 tokens
SUPABASE_JWKS_URL   = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else ""

bearer_scheme = HTTPBearer()

# Cache JWKS keys in memory (fetched once per process start)
_jwks_client: jwt.PyJWKClient | None = None

def _get_jwks_client() -> jwt.PyJWKClient:
    global _jwks_client
    if _jwks_client is None and SUPABASE_JWKS_URL:
        _jwks_client = jwt.PyJWKClient(SUPABASE_JWKS_URL)
    return _jwks_client


def _decode_token(token: str) -> dict:
    """Try HS256 first (JWT secret), fall back to RS256 (JWKS)."""

    # Peek at the header to know which alg was used
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
    except jwt.DecodeError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Malformed token: {e}")

    try:
        if alg == "HS256":
            # Signed with JWT secret
            return jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        else:
            # RS256 — use JWKS public key
            client = _get_jwks_client()
            if not client:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="RS256 token but SUPABASE_URL not configured."
                )
            signing_key = client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    payload = _decode_token(credentials.credentials)

    user_id = payload.get("sub")
    email   = payload.get("email", "")
    name    = (payload.get("user_metadata") or {}).get("full_name") or email.split("@")[0]

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject.")

    # Auto-create user row on first login
    user = db.query(UserModel).filter_by(id=user_id).first()
    if not user:
        user = UserModel(id=user_id, name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user