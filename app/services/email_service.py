import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader

from dotenv import load_dotenv

load_dotenv()


class EmailService:
    def __init__(self) -> None:
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "465"))
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_from = os.getenv("SMTP_FROM", self.smtp_email)
        self.env = Environment(loader=FileSystemLoader("app/services/templates"))

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


def send_notification_email(self, to_email, username, message):
    html_body = self.render_template(
        "email/deadline_notification.html",
        {
            "username": username,
            "message": message,
        },
    )

    self.send_html_email(
        to_email=to_email,
        subject="Уведомление",
        html_body=html_body,
    )
