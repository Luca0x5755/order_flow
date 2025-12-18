import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback or error if not set, but for now we just warn or let it fail
    print("Warning: DATABASE_URL not found in environment variables.")

# Supabase uses Postgres, so we use psycopg2 or similar. 
# Ensure the URL starts with postgresql:// or postgresql+psycopg2://
# SQLAlchemy 1.4+ deprecated postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
