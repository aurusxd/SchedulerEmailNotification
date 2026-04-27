from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    name: str
    description: str | None = None
    end_date: datetime
    user_id: int


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    start_date: datetime | None
    end_date: datetime
    user_id: int
