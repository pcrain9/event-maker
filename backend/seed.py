from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .models.user import User
from .db import AsyncSessionLocal, init_models, engine
import asyncio
import bcrypt

async def seed_database():
    # Create async session
    async with AsyncSessionLocal() as session:  # type: ignore
        # Check if we already have users
        res = await session.execute(select(User))
        users = res.scalars().all()
        if users:
            print("Database already seeded!")
            return
        # Create sample users
        sample_users = [
            {
                "username": "admin",
                "full_name": "Admin User",
                "password": "password"
            },
            {
                "username": "user",
                "full_name": "Regular User",
                "password": "user123"
            }
        ]

        # Hash passwords and create users
        for user_data in sample_users:
            # Hash password
            password = user_data['password'].encode('utf-8')
            hashed = bcrypt.hashpw(password, bcrypt.gensalt())
            
            user = User(
                username=user_data['username'],
                full_name=user_data['full_name'],
                hashed_password=hashed.decode('utf-8')
            )
            session.add(user)
        
        # Commit the changes
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())