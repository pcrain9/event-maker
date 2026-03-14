import os

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import events, announcements

from .scripts.seed import seed_database
from .routes import users

def _parse_csv_env(var_name: str, default: str) -> list[str]:
    raw_value = os.getenv(var_name, default)
    return [entry.strip().rstrip("/") for entry in raw_value.split(",") if entry.strip()]


def _parse_bool_env(var_name: str, default: str = "true") -> bool:
    return os.getenv(var_name, default).strip().lower() in {"1", "true", "yes", "on"}


app = FastAPI()
api_v1 = APIRouter(prefix="/api/v1")

cors_origins = _parse_csv_env(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
cors_allow_credentials = _parse_bool_env("CORS_ALLOW_CREDENTIALS", "true")
cors_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX")

if "*" in cors_origins and cors_allow_credentials:
    # Browsers reject wildcard origins when credentials are allowed.
    error_message = (
        "CORS misconfiguration: CORS_ALLOW_ORIGINS cannot contain '*' when "
        "CORS_ALLOW_CREDENTIALS is true. Use explicit origins or set "
        "CORS_ALLOW_CREDENTIALS=false."
    )
    print(f"❌  {error_message}")
    raise ValueError(error_message)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    print("backend STARTUP — backend.main loaded")
    # Skip database initialization if explicitly disabled or DATABASE_URL not set
    if os.getenv("SKIP_DB_INIT", "false").lower() == "true":
        print("⚠️  SKIP_DB_INIT is set, skipping database initialization")
        return
    
    if not os.getenv("DATABASE_URL"):
        print("⚠️  DATABASE_URL not set, skipping database initialization")
        return
    
    try:
        print("ℹ️  Alembic-managed schema mode enabled")
        await seed_database()
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("⚠️  Application started but database is unavailable")
        # Don't raise - allow app to start for health checks in CI/CD


@app.get("/")
@app.get("/api/v1/")
async def health_check():
    """Health check endpoint for CI/CD and monitoring."""
    return {"status": "ok", "service": "tam-events-backend"}


api_v1.include_router(users.router)
api_v1.include_router(events.router)
api_v1.include_router(announcements.router)

app.include_router(api_v1)
