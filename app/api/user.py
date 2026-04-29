from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    username: str
    password_hash: str
    email_address: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email_address: str
    created_at: datetime | None


class RegisterRequest(BaseModel):
    username: str
    email_address: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email_address: str


class AuthResponse(BaseModel):
    message: str
    user: AuthUserRead
