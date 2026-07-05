import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
TIMEZONE = os.getenv("TIMEZONE", "Europe/Paris")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lifelog.db")