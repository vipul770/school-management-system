#!/usr/bin/env python3
"""
Super Admin Registration Script
Run this script to create a super admin user for the School Management System
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.models import UserCreate, Role
from app.routes import register
from app.db import engine
from sqlmodel import Session
import getpass

def create_super_admin():
    """Create a super admin user interactively"""
    
    print("🔐 Super Admin Registration")
    print("=" * 40)
    
    # Get user input
    username = input("Enter username for super admin: ").strip()
    if not username:
        print("❌ Username cannot be empty!")
        return False
    
    # Check if username already exists
    with Session(engine) as session:
        from sqlmodel import select
        from app.models import User
        stmt = select(User).where(User.username == username)
        existing_user = session.exec(stmt).first()
        if existing_user:
            print(f"❌ User '{username}' already exists!")
            return False
    
    full_name = input("Enter full name: ").strip()
    if not full_name:
        print("❌ Full name cannot be empty!")
        return False
    
    email = input("Enter email (optional): ").strip() or None
    
    # Get password securely
    while True:
        password = getpass.getpass("Enter password: ")
        if not password:
            print("❌ Password cannot be empty!")
            continue
        
        confirm_password = getpass.getpass("Confirm password: ")
        if password != confirm_password:
            print("❌ Passwords do not match!")
            continue
        
        if len(password) < 6:
            print("❌ Password must be at least 6 characters long!")
            continue
        
        break
    
    # Create super admin user
    try:
        user_data = UserCreate(
            username=username,
            password=password,
            full_name=full_name,
            email=email,
            role=Role.superadmin,
            tenant_id=None,
            school_id=None
        )
        
        with Session(engine) as session:
            result = register(user_data, session)
            
        if result.get('success'):
            print("✅ Super admin created successfully!")
            print(f"   Username: {username}")
            print(f"   Full Name: {full_name}")
            print(f"   Email: {email or 'Not provided'}")
            print(f"   Role: superadmin")
            print("\n🚀 You can now login with these credentials!")
            return True
        else:
            print(f"❌ Failed to create super admin: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating super admin: {str(e)}")
        return False

def main():
    """Main function"""
    print("School Management System - Super Admin Registration")
    print("=" * 55)
    
    try:
        success = create_super_admin()
        if success:
            print("\n🎉 Super admin registration completed!")
        else:
            print("\n❌ Super admin registration failed!")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n❌ Registration cancelled by user!")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
