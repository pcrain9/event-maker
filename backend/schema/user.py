from datetime import datetime
from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    """Safe user response model - excludes sensitive data like hashed_password."""
    
    class Config:
        from_attributes = True
    
    id: int
    username: str
    full_name: str | None = None
    is_active: bool
    role: str
    created_at: datetime


class AdminUserCreate(BaseModel):
    username: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class AdminUserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    current_password: str | None = None
    new_password: str | None = Field(default=None, min_length=1)


class LoginResponse(BaseModel):
    """Response model for successful login."""
    
    access_token: str
    token_type: str = Field(default="bearer")
    username: str
    user: UserResponse
