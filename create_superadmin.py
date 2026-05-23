#!/usr/bin/env python3
"""
Simple Super Admin Creation Script
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.models import UserCreate, Role
from app.auth import get_password_hash
from app.db import engine
from sqlmodel import Session, select

def create_superadmin():
    """Create a superadmin user"""
    
    print("🔐 Creating Super Admin User")
    print("=" * 40)
    
    # Default superadmin credentials
    username = "superadmin"
    password = "admin123"
    full_name = "Super Admin"
    email = "admin@school.com"
    
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Full Name: {full_name}")
    print(f"Email: {email}")
    print()
    
    # Check if user already exists
    with Session(engine) as session:
        from app.models import User
        stmt = select(User).where(User.username == username)
        existing_user = session.exec(stmt).first()
        if existing_user:
            print(f"❌ User '{username}' already exists!")
            return False
    
    # Create superadmin user
    try:
        hashed_password = get_password_hash(password)
        
        superadmin = User(
            username=username,
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
            role=Role.superadmin,
            tenant_id=None,
            school_id=None
        )
        
        with Session(engine) as session:
            session.add(superadmin)
            session.commit()
            session.refresh(superadmin)
            
        print("✅ Super admin created successfully!")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"   Role: superadmin")
        print("\n🚀 You can now login with these credentials!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating super admin: {str(e)}")
        return False

if __name__ == "__main__":
    create_superadmin()
