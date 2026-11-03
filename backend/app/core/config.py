"""Configuración central. Todo se lee de variables de entorno (ver .env.example)."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "sqlite:///./worldradio.db"
    cors_origins: str = "http://localhost:5173"
    admin_sync_token: str = Field(default="", repr=False)  # nunca se imprime en logs
    radio_browser_user_agent: str = "WorldRadio/1.0 (contacto del proyecto)"
    rate_limit: str = "120/minute"
    max_page_size: int = 100

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Instancia única y cacheada (también facilita sustituirla en pruebas)."""
    return Settings()
