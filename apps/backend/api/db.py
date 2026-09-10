from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

#SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@postgresql-headless/postgres"
#SQLALCHEMY_DATABASE_URL = "postgresql://postgres:aJfbvKdNNVn8LPh7iJQK@localhost/postgres"
SQLALCHEMY_DATABASE_URL = os.environ['API_DB'] if os.environ.get('API_DB') else "postgresql://postgres:password@host.docker.internal/postgres"

engine_options = (
    {"connect_args": {"check_same_thread": False}}
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    else {"pool_size": 20, "max_overflow": 5}
)
engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
