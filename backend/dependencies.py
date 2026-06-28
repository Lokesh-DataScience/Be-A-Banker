import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, UserModel

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL        = os.getenv("SUPABASE_URL", "")

bearer_scheme = HTTPBearer()

# Lazily created JWKS client for RS256
_jwks_client = None

def _get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def _decode_token(token: str) -> dict:
    # Step 1: peek at header without verifying
    try:
        header = jwt.get_unverified_header(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Malformed token header: {e}")

    alg = header.get("alg", "HS256")

    # Step 2: verify based on algorithm
    try:
        if alg == "HS256":
            return jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        else:
            # RS256 — fetch public key from Supabase JWKS endpoint
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {e}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    payload = _decode_token(credentials.credentials)

    user_id = payload.get("sub")
    email   = payload.get("email", "")
    name    = (payload.get("user_metadata") or {}).get("full_name") or email.split("@")[0]

    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject.")

    user = db.query(UserModel).filter_by(id=user_id).first()
    if not user:
        user = UserModel(id=user_id, name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user