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
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    print("backend STARTUP — backend.main loaded")
    # Skip database initialization if explicitly disabled or DATABASE_URL not set
    import os
    
    if os.getenv("SKIP_DB_INIT", "false").lower() == "true":
        print("⚠️  SKIP_DB_INIT is set, skipping database initialization")
        return
    
    if not os.getenv("DATABASE_URL"):
        print("⚠️  DATABASE_URL not set, skipping database initialization")
        return
    
    try:
        # Ensure tables exist first, then seed data
        await init_models()
        await seed_database()
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("⚠️  Application started but database is unavailable")
        # Don't raise - allow app to start for health checks in CI/CD


@app.get("/")
async def health_check():
    """Health check endpoint for CI/CD and monitoring."""
    return {"status": "ok", "service": "tam-events-backend"}


app.include_router(users.router)
app.include_router(events.router)
