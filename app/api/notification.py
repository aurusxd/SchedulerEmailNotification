from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    message: str
    status: str = "Not send"
    task_id: int
    send_at: datetime | None = None


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    status: str
    send_at: datetime | None
    task_id: int
