from sqlalchemy import (
    Column, Integer, DateTime, 
    VARCHAR, NVARCHAR
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(NVARCHAR(255), unique=True, nullable=False)
    password_hash = Column(NVARCHAR(255), nullable=False)
    email_address = Column(VARCHAR(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
  
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email_address}')>"




