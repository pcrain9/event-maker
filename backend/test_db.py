from dotenv import load_dotenv
import asyncio
import asyncpg
import os

async def test_db():
    load_dotenv()
    url = os.getenv("DATABASE_URL")
    
    # Convert SQLAlchemy URL to asyncpg format if needed
    if "postgresql+asyncpg://" in url:
        url = url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(url)
        version = await conn.fetchval('SELECT version()')
        print(f"Connected successfully!\nPostgreSQL version: {version}")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())