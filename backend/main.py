from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import events

from .scripts.seed import seed_database
from .db import init_models, get_db
from .routes import users

app = FastAPI()
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    print("backend STARTUP — backend.main loaded")
    # Skip database initialization if DATABASE_URL is not set (e.g., in CI/CD)
    import os
    if os.getenv("DATABASE_URL"):
        # Ensure tables exist first, then seed data
        await init_models()
        await seed_database()
    else:
        print("⚠️  DATABASE_URL not set, skipping database initialization")


app.include_router(users.router)
app.include_router(events.router)
