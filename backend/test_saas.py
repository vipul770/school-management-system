#!/usr/bin/env python3
"""
Simple test script for SaaS functionality
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.saas_routes import saas_router

# Create a minimal FastAPI app for testing
app = FastAPI(
    title="School Management System - SaaS Test",
    description="Test SaaS functionality",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api", tags=["API"])
app.include_router(saas_router, prefix="/api", tags=["SaaS"])

@app.get('/')
def root():
    return {"message": "SaaS Test API - School Management System"}

@app.get('/hello')
def hello():
    return {"message": "SaaS Test API is running!", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    print("Starting SaaS Test API on http://localhost:8000")
    print("Available endpoints:")
    print("  - GET /api/saas/invitations")
    print("  - POST /api/saas/invite-school")
    print("  - POST /api/saas/register-school")
    print("  - GET /api/saas/registration-requests")
    print("  - POST /api/saas/approve-registration/{id}")
    print("  - POST /api/saas/reject-registration/{id}")
    print("\nAPI Documentation: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
