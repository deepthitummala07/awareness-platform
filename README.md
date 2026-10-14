
# AI-Powered Multilingual Public Awareness and Mass Communication Platform

## Overview

A platform designed to support the creation and distribution of
multilingual public awareness messages through multiple communication
channels.

## Technology Stack

- Backend: FastAPI and Python
- Frontend: React and Vite
- Database: SQLite
- ORM: SQLAlchemy
- Migrations: Alembic
- HTTP client: Axios

## Prerequisites

- Python 3.13
- Node.js and npm
- Git

## Run the Backend

Open a terminal in the backend folder:

    .\.venv\Scripts\Activate.ps1
    python -m uvicorn app.main:app --reload

API health check: http://127.0.0.1:8000/health

Interactive API documentation: http://127.0.0.1:8000/docs

## Run the Frontend

Open a separate terminal in the frontend folder:

    npm install
    npm run dev

Open the local URL displayed by Vite.

## Database Migrations

From the backend folder:

    alembic upgrade head

## Environment Configuration

Create a backend `.env` file containing the application settings.
Never commit `.env`, credentials, or real API keys to GitHub.
