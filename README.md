**Проект:** TaskNotify - планировщик задач с email-уведомлениями  
**Команда:** *9/3-РПО-2023/1*, Никита Попов, Роман Макеев

## 1. Общие сведения

- **Наименование проекта:** `TaskNotify`
- **Назначение системы:** веб-приложение для создания и управления задачами с автоматической отправкой email-уведомления при наступлении дедлайна.

## 2. Требования к функциональности

Система должна:

- регистрировать пользователя (`/api/auth/register`);
- авторизовывать пользователя (`/api/auth/login`);
- создавать задачи с привязкой к пользователю (`/api/tasks`);
- отображать список задач пользователя;
- фильтровать задачи по статусу;
- редактировать статус/приоритет/тип/описание задачи в интерфейсе;
- удалять задачи из списка;
- запускать фоновую проверку дедлайнов по расписанию (`APScheduler`);
- отправлять email-уведомление через SMTP при наступлении дедлайна;
- сохранять в БД статус отправки уведомления (`Sent` / `Failed`) в таблице `notifications`;
- не отправлять повторное уведомление, если успешное уведомление уже было отправлено.

## 3. Стек технологий

- **Язык программирования:** Python, JavaScript
- **Backend:** FastAPI, SQLAlchemy (async), Alembic
- **Frontend:** HTML, CSS, JavaScript (ES Modules, Fetch API)
- **СУБД:** PostgreSQL
- **Планировщик:** APScheduler
- **Протокол/API:** REST API, SMTP
- **Сторонние библиотеки:** Jinja2, pydantic-settings, python-dotenv, uvicorn

## 4. Интеграционный план

- Frontend на HTML/CSS/JS интегрируется с Backend на FastAPI через REST API (JSON).
- Backend взаимодействует с PostgreSQL через SQLAlchemy.
- Планировщик APScheduler запускается вместе с приложением FastAPI (lifespan).
- Планировщик опрашивает БД каждые `SCHEDULER_INTERVAL_SECONDS` секунд.
- Для задач с истекшим дедлайном вызывается email-сервис.
- Email-сервис формирует письмо по шаблону Jinja2 и отправляет его через SMTP.
- Результат отправки записывается в таблицу `notifications`.

## Пример .env для запуска

```env
POSTGRES_USER=scheduler_user
POSTGRES_PASSWORD=secret123
POSTGRES_DB=scheduler_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=TaskNotify <your_email@gmail.com>

SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL_SECONDS=60
SCHEDULER_TIMEZONE=Asia/Bangkok
```

## Быстрый запуск

```bash
uv sync
docker-compose up -d
uv run alembic upgrade head
uv run main.py
```
