from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = 'postgresql+asyncpg://dummy:dummy@localhost:5432/dummy'

    # Supabase
    supabase_url: str = 'https://dummy.supabase.co'
    supabase_anon_key: str = 'dummy'
    supabase_service_role_key: str = 'dummy'
    supabase_jwt_secret: str = 'dummy'

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Environment
    env: str = "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        return self.env == "development"


settings = Settings()  # type: ignore[call-arg]
