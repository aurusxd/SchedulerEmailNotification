from pydantic import BaseModel, Field


from .database import DbConfig
from .scheduler import SchedulerConfig
from .smtp import SmtpConfig


class Config(BaseModel):
    database: DbConfig = Field(default_factory=DbConfig)
    smtp: SmtpConfig = Field(default_factory=SmtpConfig)
    scheduler: SchedulerConfig = Field(default_factory=SchedulerConfig)


config = Config()
