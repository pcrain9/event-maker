from datetime import datetime, timedelta, timezone
from typing import Annotated
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError, OperationalError, TimeoutError as SQLTimeoutError

from backend.core.auth import (
    get_current_user,
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    JWT_EXPIRATION_HOURS
)
from backend.schema.user import LoginResponse, UserResponse
from ..db import get_db
from ..models.user import User

router = APIRouter(prefix="/users",tags=["users"])

@router.post("/token")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    try:
        # Query user from database
        q = select(User).where(User.username == form_data.username)
        res = await db.execute(q)
        user = res.scalar_one_or_none()
        
    except OperationalError as e:
        # Database connection issues
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed. Please try again later."
        )
    except SQLTimeoutError as e:
        # Query timeout
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Database query timed out. Please try again."
        )
    except SQLAlchemyError as e:
        # Generic database errors
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during authentication. Please try again."
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password (user is an ORM instance returned by the query)
    try:
        is_valid = bcrypt.checkpw(
            form_data.password.encode('utf-8'),
            user.hashed_password.encode('utf-8')
        )
    except Exception as e:
        # Password verification failure
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password verification failed"
        )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate JWT token
    try:
        expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
        token_data = {
            "sub": user.username,
            "user_id": user.id,
            "exp": expiration
        }
        token = jwt.encode(token_data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return LoginResponse(
            access_token=token,
            username=user.username,
            user=UserResponse.model_validate(user)
        )
    except Exception as e:
        # Token generation failure
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate authentication token"
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user