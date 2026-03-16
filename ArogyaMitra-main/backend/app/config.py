from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Application basic config
    PROJECT_NAME: str = "ArogyaMitra API"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    MONGODB_URI: str
    DATABASE_NAME: str

    # External APIs
    GROQ_API_KEY: Optional[str] = None
    YOUTUBE_API_KEY: Optional[str] = None
    SPOONACULAR_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="allow" # allow extra fields from env that we dont explicitly define
    )

settings = Settings()
