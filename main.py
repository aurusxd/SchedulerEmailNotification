from app.api.routers import create_app
from fastapi.middleware.cors import CORSMiddleware


app = create_app()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # <- разрешенный фронт
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
