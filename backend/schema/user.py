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
    created_at: datetime


class LoginResponse(BaseModel):
    """Response model for successful login."""
    
    access_token: str
    token_type: str = Field(default="bearer")
    username: str
    user: UserResponse
