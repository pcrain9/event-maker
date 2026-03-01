from sqlalchemy import select
from ..models.user import User
from ..db import get_session_factory, init_models, get_engine
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def seed_user_database():
    session_factory = get_session_factory()
    async with session_factory() as session:  # type: ignore
        # Check if we already have users
        res = await session.execute(select(User))
        users = res.scalars().all()
        if users:
            print("Database already seeded!")
            return
        
        # Get admin credentials from environment variables
        admin_username = os.getenv("DEFAULT_ADMIN_USERNAME")
        admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD")
        
        # Validate that credentials are set
        if not admin_username or not admin_password:
            raise ValueError(
                "❌ ERROR: Admin credentials not found in environment variables!\n"
                "Please set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD in your .env file.\n"
                "These credentials are required for security and have no default values."
            )
        
        # Create sample users
        sample_users = [
            {
                "username": admin_username,
                "full_name": "Admin User",
                "password": admin_password,
                "role": "admin"
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
                hashed_password=hashed.decode('utf-8'),
                role=user_data['role']
            )
            session.add(user)
        
        # Commit the changes
        await session.commit()
        print("Database seeded successfully!")