from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@postgresql-headless/postgres"
#SQLALCHEMY_DATABASE_URL = "postgresql://postgres:aJfbvKdNNVn8LPh7iJQK@localhost/postgres"
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_size=20, max_overflow=5)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
