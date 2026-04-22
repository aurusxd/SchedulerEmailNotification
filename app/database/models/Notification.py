from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.models.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message = Column(String(255), nullable=False)
    status = Column(String(25), server_default="Not send", nullable=False)
    send_at = Column(DateTime, server_default=func.now())
    task_id = Column(
        Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )

    task = relationship("Task", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, status='{self.status}', task_id={self.task_id})>"
