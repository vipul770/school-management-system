from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import json
from pathlib import Path
from dotenv import load_dotenv

from .db import create_db_and_tables
from .routes import router
from .saas_routes import saas_router
import logging

logger = logging.getLogger(__name__)

MODULE_ROUTES_AVAILABLE = False
if os.getenv("ENABLE_MODULE_ROUTES", "").strip().lower() in {"1", "true", "yes", "on"}:
    try:
        from .module_routes import (
            classrooms_router,
            students_router,
            teachers_router,
            attendance_router,
            exams_router,
            timetable_router,
            announcements_router,
            messages_router,
            fee_router,
            hr_router,
            library_router,
            permissions_router,
        )
        MODULE_ROUTES_AVAILABLE = True
    except Exception as exc:
        logger.warning("Module routes disabled during startup: %s", exc)

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    create_db_and_tables()
    yield

app = FastAPI(
    title="School Management System",
    description="A comprehensive school management system with multi-tenant support",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api", tags=["API"])

# Include SaaS router
app.include_router(saas_router, prefix="/api")

if MODULE_ROUTES_AVAILABLE:
    app.include_router(classrooms_router, prefix="/api")
    app.include_router(students_router, prefix="/api")
    app.include_router(teachers_router, prefix="/api")
    app.include_router(attendance_router, prefix="/api")
    app.include_router(exams_router, prefix="/api")
    app.include_router(timetable_router, prefix="/api")
    app.include_router(announcements_router, prefix="/api")
    app.include_router(messages_router, prefix="/api")
    app.include_router(fee_router, prefix="/api")
    app.include_router(hr_router, prefix="/api")
    app.include_router(library_router, prefix="/api")
    app.include_router(permissions_router, prefix="/api")

@app.get('/')
def root():
    """Root endpoint"""
    return {"message": "Welcome to School Management System API"}

@app.get('/hello')
def hello():
    """Health check endpoint"""
    return {"message": "Welcome to the School Management API", "version": "1.0.0"}
