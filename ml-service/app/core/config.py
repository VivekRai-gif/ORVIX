import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "ORVIX ML Recovery Intelligence Service"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    ENV: str = os.getenv("ENV", "development")

settings = Settings()
