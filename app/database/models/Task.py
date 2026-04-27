from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.models.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    status = Column(String(100), nullable=False)
    priority = Column(String(100), nullable=False)
    type = Column(String(70), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, server_default=func.now())
    end_date = Column(DateTime, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    user = relationship("User", back_populates="tasks")

    notifications = relationship(
        "Notification", back_populates="task", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Task(id={self.id}, name='{self.name}', user_id={self.user_id})>"
