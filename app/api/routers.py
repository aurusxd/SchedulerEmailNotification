from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.notification import NotificationCreate, NotificationRead
from app.api.task import TaskCreate, TaskRead
from app.api.user import UserCreate, UserRead
from app.database.models.Notification import Notification
from app.database.models.Task import Task
from app.database.models.User import User
from app.depends import provider

router = APIRouter(prefix="/api", tags=["api"])


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    session: AsyncSession = Depends(provider.get_session),
) -> User:
    user = User(**payload.model_dump())
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


@router.get("/users", response_model=list[UserRead])
async def list_users(
    session: AsyncSession = Depends(provider.get_session),
) -> list[User]:
    result = await session.execute(select(User).order_by(User.id))
    return list(result.scalars().all())


@router.post("/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    session: AsyncSession = Depends(provider.get_session),
) -> Task:
    user = await session.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    task = Task(**payload.model_dump())
    session.add(task)
    await session.flush()
    await session.refresh(task)
    return task


@router.get("/tasks", response_model=list[TaskRead])
async def list_tasks(
    user_id: int | None = None,
    session: AsyncSession = Depends(provider.get_session),
) -> list[Task]:
    query = select(Task).order_by(Task.id)
    if user_id is not None:
        query = query.where(Task.user_id == user_id)

    result = await session.execute(query)
    return list(result.scalars().all())


@router.post(
    "/notifications",
    response_model=NotificationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification(
    payload: NotificationCreate,
    session: AsyncSession = Depends(provider.get_session),
) -> Notification:
    task = await session.get(Task, payload.task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    notification = Notification(**payload.model_dump(exclude_none=True))
    session.add(notification)
    await session.flush()
    await session.refresh(notification)
    return notification


@router.get("/notifications", response_model=list[NotificationRead])
async def list_notifications(
    task_id: int | None = None,
    session: AsyncSession = Depends(provider.get_session),
) -> list[Notification]:
    query = select(Notification).order_by(Notification.id)
    if task_id is not None:
        query = query.where(Notification.task_id == task_id)

    result = await session.execute(query)
    return list(result.scalars().all())


def create_app() -> FastAPI:
    app = FastAPI(title="Scheduler Email Notification API")
    app.include_router(router)
    return app
