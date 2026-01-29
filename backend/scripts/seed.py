from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user import User
from ..db import AsyncSessionLocal, init_models, engine
from .seed_users import seed_user_database
from .seed_event import seed_event_database
import asyncio
import bcrypt

async def seed_database():
    # Recreate all tables with updated schema
    await init_models()
    # Seed data
    await seed_event_database()
    await seed_user_database()

if __name__ == "__main__":
    asyncio.run(seed_database())