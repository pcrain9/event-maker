FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed by asyncpg and some Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project source
COPY . /app

EXPOSE 8000

# Always run Alembic migrations before app startup.
CMD ["sh", "-ec", "echo 'Running Alembic migrations...'; cd backend && alembic upgrade head && cd /app; exec uvicorn backend.main:app --host 0.0.0.0 --port 8000"]
