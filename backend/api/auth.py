from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from backend.core.database import get_db
from backend.core.auth import (
    hash_password, authenticate_user, create_token, get_user_by_email
)
from backend.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# ── Request schemas ──────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "viewer"  # default role

class LoginRequest(BaseModel):
    email: str
    password: str

# ── Register ─────────────────────────────────────────────────────────────
@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    # Create new user
    user = User(
        full_name=req.full_name,
        email=req.email,
        hashed_password=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }

# ── Login ─────────────────────────────────────────────────────────────────
@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    token = create_token({
        "sub": user.email,
        "role": user.role,
        "name": user.full_name,
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name,
    }

# ── Get current user (test route) ─────────────────────────────────────────
@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    from backend.core.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user_by_email(db, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
    }