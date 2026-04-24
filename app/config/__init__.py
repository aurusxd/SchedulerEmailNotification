from pydantic import BaseModel, Field


from .database import DbConfig


class Config(BaseModel):
    database: DbConfig = Field(default_factory=DbConfig)


config = Config()
