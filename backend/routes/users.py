from datetime import datetime, timedelta, timezone
from typing import Annotated
import bcrypt
from fastapi import APIRouter,Depends,HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import os
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.auth import get_current_user
from ..db import get_db
from ..models.user import User
from pydantic import BaseModel
from sqlalchemy import select

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY","your_jwt_secret_key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM","HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS","24"))

class LoginResponse(BaseModel):
    access_token: str
    username: str

router = APIRouter(prefix="/users",tags=["users"])

@router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],db: AsyncSession = Depends(get_db)):
    q = select(User).where(User.username == form_data.username)
    res = await db.execute(q)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password (user is an ORM instance returned by the query)
    is_valid = bcrypt.checkpw(
        form_data.password.encode('utf-8'),
        user.hashed_password.encode('utf-8')
    )
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate JWT token
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "exp": expiration
    }
    token = jwt.encode(token_data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    return LoginResponse(access_token=token, username=user.username)

@router.get("/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user