# import os

# class Config:
#     """Base Configuration."""
#     SECRET_KEY = os.environ.get('SECRET_KEY', 'a_super_secret_key')
#     JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'another_super_secret_key')
    
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///codecollab.db')
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
    
#     # --- NEW: Database Connection Pool Settings ---
#     # These settings help manage connections that might be closed by the database server.
#     SQLALCHEMY_POOL_RECYCLE = 280  # Recycle connections after 280 seconds
#     SQLALCHEMY_POOL_TIMEOUT = 20   # Timeout for getting a connection from the pool
#     SQLALCHEMY_POOL_PRE_PING = True # Checks if a connection is alive before using it

import os
from dotenv import load_dotenv

# Load .env (for local development only)
load_dotenv()

class Config:
    """Base Configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_super_secret_key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'another_super_secret_key')

    # Load DB URL from env or fallback
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///codecollab.db')

    # Ensure compatibility with older URLs
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")

    # Enforce SSL for cloud databases
    if "sslmode" not in DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL += "?sslmode=require"

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Connection Pool Settings
    SQLALCHEMY_POOL_RECYCLE = 280
    SQLALCHEMY_POOL_TIMEOUT = 20
    SQLALCHEMY_POOL_PRE_PING = True
