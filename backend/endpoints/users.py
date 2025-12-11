from datetime import datetime, timedelta, timezone
import bcrypt
from fastapi import APIRouter,Depends,HTTPException
import jwt
import os
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..models.user import User
from pydantic import BaseModel
from sqlalchemy import select

router = APIRouter(prefix="/users",tags=["users"])
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY","your_jwt_secret_key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM","HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS","24"))

class CreateUser(BaseModel):
    username: str
    hashed_password: str
    full_name: str | None = None
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    print("login attempt for:", payload.username)
    # print("db user:", user.username if user else None)
    # print("stored hashed_password:", user.hashed_password if user else None)
    # Find user by username
    q = select(User).where(User.username == payload.username)
    res = await db.execute(q)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    is_valid = bcrypt.checkpw(
        payload.password.encode('utf-8'),
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

@router.post("/")
async def create_user(payload: CreateUser, db: AsyncSession = Depends(get_db)):
    # check existing
    q = select(User).where(User.username == payload.username)
    res = await db.execute(q)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(username=payload.username, hashed_password=payload.hashed_password, full_name=payload.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "username": user.username}

@router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    q = select(User)
    res = await db.execute(q)
    users = res.scalars().all()
    return users