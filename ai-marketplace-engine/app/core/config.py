import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    AME_HOST: str = "0.0.0.0"
    AME_PORT: int = 8000
    AME_DEBUG: bool = True

    # Security
    AME_API_KEY: str = "workly_ame_secret_key"
    AME_WEBHOOK_SECRET: str = "workly_ame_webhook_secret"

    # Databases
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ame_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI API Keys
    GEMINI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    # Integration Webhook Configuration
    MARKETPLACE_BASE_URL: str = "http://localhost:3000"
    MARKETPLACE_WEBHOOK_PATH: str = "/api/webhooks/ame"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

# Read settings from environment / .env file
settings = Settings()
