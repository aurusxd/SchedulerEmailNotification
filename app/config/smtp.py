from pydantic_settings import BaseSettings, SettingsConfigDict


class SmtpConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    SMTP_EMAIL: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
