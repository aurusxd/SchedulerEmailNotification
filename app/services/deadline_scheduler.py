import asyncio
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import exists, select
from sqlalchemy.orm import selectinload

from app.config import config
from app.database.models.Notification import Notification
from app.database.models.Task import Task
from app.depends import provider
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class DeadlineSchedulerService:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler(timezone=config.scheduler.SCHEDULER_TIMEZONE)
        self.email_service: EmailService | None = None
        self.job_id = "deadline-notification-job"

    def start(self) -> None:
        if not config.scheduler.SCHEDULER_ENABLED:
            logger.info("Deadline scheduler disabled by config.")
            return

        try:
            self.email_service = EmailService()
        except ValueError as exc:
            logger.warning("Deadline scheduler not started: %s", exc)
            return

        if self.scheduler.running:
            return

        self.scheduler.add_job(
            self.process_due_tasks,
            "interval",
            seconds=config.scheduler.SCHEDULER_INTERVAL_SECONDS,
            id=self.job_id,
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        self.scheduler.start()
        logger.info(
            "Deadline scheduler started. Interval: %s seconds.",
            config.scheduler.SCHEDULER_INTERVAL_SECONDS,
        )

    async def shutdown(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            logger.info("Deadline scheduler stopped.")

    async def process_due_tasks(self) -> None:
        async with provider.session_factory() as session:
            try:
                tasks = await self._get_due_tasks(session)
                for task in tasks:
                    await self._send_notification(session, task)
                await session.commit()
            except Exception:
                await session.rollback()
                logger.exception("Deadline notification job failed.")

    async def _get_due_tasks(self, session) -> list[Task]:
        sent_notification_exists = exists(
            select(Notification.id).where(
                Notification.task_id == Task.id,
                Notification.status == "Sent",
            )
        )
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        result = await session.execute(
            select(Task)
            .options(selectinload(Task.user))
            .where(Task.end_date <= now)
            .where(~sent_notification_exists)
            .order_by(Task.end_date)
        )
        return list(result.scalars().all())

    async def _send_notification(self, session, task: Task) -> None:
        if self.email_service is None:
            return

        username = task.user.username
        to_email = task.user.email_address
        deadline_text = task.end_date.strftime("%d.%m.%Y %H:%M")
        message = (
            f"Срок выполнения задачи '{task.name}' наступил {deadline_text}. "
            "Проверьте задачу в приложении."
        )

        notification = Notification(
            task_id=task.id,
            message=message,
            status="Sent",
        )
        session.add(notification)

        try:
            await asyncio.to_thread(
                self.email_service.send_notification_email,
                to_email,
                username,
                message,
            )
            logger.info("Notification sent for task_id=%s to %s", task.id, to_email)
        except Exception as exc:
            notification.status = "Failed"
            notification.message = f"{message} Ошибка отправки: {exc}"
            logger.exception("Failed to send notification for task_id=%s", task.id)
