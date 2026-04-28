import smtplib
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader

from app.config import config


class EmailService:
    def __init__(self) -> None:
        self.smtp_host = config.smtp.SMTP_HOST
        self.smtp_port = config.smtp.SMTP_PORT
        self.smtp_email = config.smtp.SMTP_EMAIL
        self.smtp_password = config.smtp.SMTP_PASSWORD
        self.smtp_from = config.smtp.SMTP_FROM or self.smtp_email
        templates_dir = Path(__file__).resolve().parent / "templates"
        self.env = Environment(loader=FileSystemLoader(str(templates_dir)))

        if not self.smtp_email:
            raise ValueError("SMTP_EMAIL is not set")
        if not self.smtp_password:
            raise ValueError("SMTP_PASSWORD is not set")

    def render_template(self, template_name: str, context: dict) -> str:
        template = self.env.get_template(template_name)
        return template.render(**context)

    def send_email(self, to_email: str, subject: str, body: str) -> None:
        msg = MIMEMultipart()
        msg["From"] = self.smtp_from
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
            server.login(self.smtp_email, self.smtp_password)
            server.sendmail(self.smtp_from, to_email, msg.as_string())

    def send_html_email(self, to_email: str, subject: str, html_body: str) -> None:
        msg = MIMEMultipart("alternative")
        msg["From"] = self.smtp_from
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
            server.login(self.smtp_email, self.smtp_password)
            server.sendmail(self.smtp_from, to_email, msg.as_string())

    def send_notification_email(
        self,
        to_email: str,
        username: str,
        message: str,
        subject: str = "Уведомление о дедлайне",
    ) -> None:
        html_body = self.render_template(
            "deadline_notification.html",
            {
                "username": username,
                "message": message,
            },
        )

        self.send_html_email(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
        )
