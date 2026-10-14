
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.services.role_service import seed_roles
from app.core.database import SessionLocal
from app.core.config import settings
from app.core.database import Base, engine
from app import models

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for multilingual public awareness and mass communication.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(auth_router)


@app.on_event("startup")
def initialize_roles():
    db = SessionLocal()
    try:
        seed_roles(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Welcome to the Awareness Platform API"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Backend is running successfully"
    }


@app.get("/database-health")
def database_health():
    from sqlalchemy import text

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"status": "connected"}
