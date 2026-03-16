import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:///./argos.db"
    redis_url: str = "redis://localhost:6379"
    claude_api_key: str = ""
    github_token: str = ""
    vault_master_key: str = ""
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

    def get_database_url(self):
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
