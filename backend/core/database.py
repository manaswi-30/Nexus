from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nexus_user:nexus_pass@localhost:5432/nexus_db")

# For async operations
ASYNC_DATABASE_URL = DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Sync engine (for migrations)
engine = create_engine(DATABASE_URL)

# Async engine (for API calls)
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# Session factories
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = AsyncSession(bind=async_engine)

# Base class for all models
Base = declarative_base()

# Dependency — use this in API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()