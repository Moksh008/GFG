from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token, decode_token, get_current_user, hash_password, verify_password,
)
from app.entities import User
from app.schemas.requests import LoginIn, ProfileUpdate, RefreshIn, RegisterIn
from app.schemas.serializers import user_out
from app.utils.seed import seed_new_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens(user: User) -> dict:
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "user": user_out(user),
    }


def _authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalars(select(User).where(User.email == email.lower())).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return user


@router.post("/register", status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalars(select(User).where(User.email == email)).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(email=email, hashed_password=hash_password(body.password), full_name=body.full_name.strip())
    db.add(user)
    db.flush()
    seed_new_user(db, user)
    db.commit()
    return _tokens(user)


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    return _tokens(_authenticate(db, body.email, body.password))


@router.post("/token", include_in_schema=True, summary="OAuth2 password flow (for Swagger 'Authorize')")
def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return _tokens(_authenticate(db, form.username, form.password))


@router.post("/refresh")
def refresh(body: RefreshIn, db: Session = Depends(get_db)):
    user = db.get(User, decode_token(body.refresh_token, "refresh"))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return _tokens(user)


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user_out(user)


@router.patch("/me")
def update_me(body: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.add(user)
    db.commit()
    return user_out(user)


@router.delete("/me", status_code=204)
def delete_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Right to erasure: deletes the account, all records and stored images/audio."""
    from app.utils.storage import delete_user_files

    delete_user_files(user.id)
    db.delete(user)
    db.commit()
