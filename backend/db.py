from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import os
from typing import Optional

# Load environment variables
load_dotenv()

# Get database URL and strip any quotes
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Remove surrounding quotes if present (common .env file mistake)
    DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")

# Create base class for models
Base = declarative_base()

# Global engine instance
_engine: Optional[AsyncEngine] = None
_session_factory: Optional[async_sessionmaker[AsyncSession]] = None

def get_engine() -> AsyncEngine:
    """Lazy initialization of database engine."""
    global _engine
    if _engine is None:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")
        _engine = create_async_engine(
            DATABASE_URL,
            echo=os.getenv("SQL_ECHO", "false").lower() == "true",
        )
    return _engine

def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Lazy initialization of session factory."""
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False
        )
    return _session_factory

async def get_db():
    """Async session dependency for FastAPI."""
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise