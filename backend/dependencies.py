import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, UserModel

# ── Supabase JWT config ───────────────────────────────────────────────────────
# Get this from: Supabase Dashboard → Settings → API → JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_JWT_ALGORITHM = "HS256"

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserModel:
    token = credentials.credentials

    # ── Decode and verify JWT from Supabase ──────────────────────────────────
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[SUPABASE_JWT_ALGORITHM],
            options={"verify_aud": False},  # Supabase sets aud="authenticated"
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")

    # ── Extract user info from payload ────────────────────────────────────────
    user_id = payload.get("sub")          # Supabase UID
    email   = payload.get("email", "")
    name    = payload.get("user_metadata", {}).get("full_name", email.split("@")[0])

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject.")

    # ── Auto-create user row on first login ───────────────────────────────────
    user = db.query(UserModel).filter_by(id=user_id).first()
    if not user:
        user = UserModel(id=user_id, name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user