# 📅 TaskNotify: Планировщик задач с Email-оповещением


> ⚡ Веб-система управления задачами с автоматической отправкой напоминаний на Email при наступлении дедлайна.

---

## 📖 1. Общие сведения
| Параметр | Описание |
|:---|:---|
| **Наименование проекта** | `TaskNotify: Планировщик задач с Email-оповещением` |
| **Назначение системы** | Создание, отслеживание и контроль выполнения задач. Ключевая цель — **автоматическое информирование пользователя по электронной почте** при наступлении срока выполнения (дедлайна) для предотвращения просрочек. |

---

## ⚙️ 2. Требования к функциональности
- [x] 🔐 **Аутентификация** — регистрация и безопасный вход пользователей.
- [x] 📝 **Создание задач** — добавление задач с названием, описанием и точным дедлайном.
- [x] 🔍 **Управление списком** — просмотр, фильтрация (`активные / просроченные / выполненные`) и сортировка.
- [x] ✏️ **Редактирование** — изменение параметров и удаление существующих задач.
- [x] ⏱️ **Фоновый мониторинг** — автоматическая проверка дедлайнов (настраиваемый интервал, напр. раз в минуту).
- [x] 📧 **Email-уведомления** — отправка письма в момент наступления дедлайна.
- [x] 📊 **Логирование отправки** — фиксация статуса рассылки для исключения дублирования писем.

---

## 🛠️ 3. Стек технологий
| Категория | Технологии & Инструменты |
|:---|:---|
| 🐍 **Язык** | `Python 3.10+` |
| 🌐 **Backend** | `FastAPI` (REST API) |
| 🗄️ **СУБД** | `PostgreSQL` (prod) / `SQLite` (dev/test) |
| 📡 **Протоколы / API** | `SMTP` (Gmail, Yandex, Mailgun и др.) |
| 📦 **Библиотеки** | `SQLAlchemy`, `Alembic`, `Pydantic`, `Jinja2`, `python-dotenv` |
| ⏳ **Планировщик** | `APScheduler` **или** `Celery` + `Redis` |
| 🎨 **Frontend** | `HTML5`, `CSS3` (Bootstrap/Tailwind), `JavaScript` (Fetch API) |
| 🐳 **Контейнеризация** | `Docker`, `docker-compose` |

---
## Прототип базы данных

<img width="989" height="636" alt="image" src="https://github.com/user-attachments/assets/a4490efd-aa21-4d69-8456-bf744a95a7bc" />


---

## 🚀 Быстрый старт

### Требования
- **Python**
- **UV**
- **Docker** и **Docker Compose** (для развертывания)
- **.env** файл с конфигурацией (см. примеры ниже)

### Установка зависимостей

```bash
uv sync
pre-commit install
```

### Локальное развертывание

#### 1. Создать .env файл

```bash
EXCEPT_LOG=true

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

#### 2. Запустить PostgreSQL

```bash
docker-compose up -d
```

#### 3. Выполнить миграции БД

```bash
uv run alembic upgrade head
```

#### 4. Запустить приложение

```bash
# Локальный запуск с автоперезагрузкой
uv run main.py
```

### Настройка уведомлений по email

1. Заполни SMTP-переменные в `.env`.
2. Для Gmail включи двухфакторную аутентификацию и создай `App Password`.
3. Укажи этот пароль в `SMTP_PASSWORD`, а в `SMTP_EMAIL` - адрес отправителя.
4. Запусти приложение: при старте поднимется `APScheduler`.
5. Планировщик раз в `SCHEDULER_INTERVAL_SECONDS` проверяет задачи, у которых `end_date <= now`.
6. Если для задачи еще нет успешной записи в `notifications` со статусом `Sent`, сервис отправит письмо и создаст запись в таблице `notifications`.

### Как это работает в проекте

- `APScheduler` запускается вместе с FastAPI через lifecycle приложения.
- Проверка дедлайнов находится в `app/services/deadline_scheduler.py`.
- Отправка email идет через `app/services/email_service.py`.
- Шаблон письма лежит в `app/services/templates/deadline_notification.html`.

### Важные замечания

- Если SMTP не настроен, API запустится, но планировщик уведомлений не стартует.
- Повторные письма для одной и той же задачи не отправляются, если уже есть успешная запись `Sent`.
- Если отправка письма упала, в `notifications` создается запись со статусом `Failed`, и задача будет повторно проверена на следующем цикле.




## 🔗 4. Интеграционный план

### 🔄 Схема взаимодействия
    FE[🖥️ Frontend HTML/JS] -->|REST API (GET/POST/PUT/DELETE)| BE[⚡ Backend FastAPI]
    BE -->|ORM SQLAlchemy| DB[(🗄️ PostgreSQL)]
    BE -->|Запуск фоновой задачи| SCHED[⏳ Планировщик APScheduler]
    SCHED -->|Опрос БД| DB
    SCHED -->|Триггер дедлайна| MAIL[📧 Email-сервис]
    MAIL -->|Рендер Jinja2| TPL[📄 Шаблоны писем]
    MAIL -->|SMTP| USER[👤 Почта пользователя]
    MAIL -->|Подтверждение отправки| SCHED
    SCHED -->|Обновление флага notification_sent| DB
---

```text
📝 Пошаговый порядок интеграции
Frontend ↔ Backend API — обмен данными через REST API (JSON).
Backend API ↔ PostgreSQL — чтение/запись задач и пользователей через SQLAlchemy.
Планировщик → БД — фоновый опрос (каждые N секунд) на поиск задач с наступившим дедлайном и без отправленного уведомления.
Планировщик → Email-сервис — вызов сервиса отправки при обнаружении целевых задач.
Email-сервис → SMTP — формирование письма (Jinja2) и отправка на адрес пользователя.
Email-сервис → Планировщик/БД — обновление флага notification_sent = True для предотвращения повторных отправок.
```
---
```text
tasknotify/
├── app/
│   ├── api/                 # 🌐 REST API роуты
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   └── tasks.py
│   │   │   └── router.py
│   │   └── dependencies.py
│   │
│   ├── core/                # ⚙️ Конфигурация и безопасность
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── db/                  # 🗄️ База данных
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── services/            # 🧩 Бизнес-логика
│   │   ├── email_service.py
│   │   ├── task_service.py
│   │   └── templates/
│   │       └── deadline_email.html
│   │
│   ├── scheduler/           # ⏱️ Планировщик
│   │   ├── jobs.py
│   │   └── scheduler_manager.py
│   │
│   ├── frontend/              # 🎨 Frontend
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   │
│   └── main.py              # 🚀 Точка входа
│
├── migrations/              # 📦 Alembic миграции
├── tests/                   # 🧪 Тесты
├── docker-compose.yml       # 🐳 Docker Compose
├── Dockerfile               # 🐳 Docker образ           
├── requirements.txt         # 📦 Зависимости
└── pyproject.toml           # 📦 Зависимости для uv 
```
