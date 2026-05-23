#!/usr/bin/env python3
"""
Simple sample data creation script that avoids SQLModel conflicts
"""

import sys
import os
from datetime import datetime, date

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db import engine
from app.models import User, Role, Tenant, School
from app.auth import get_password_hash
from sqlmodel import Session, select

def create_sample_users():
    """Create sample users for different roles"""
    
    print("👥 Creating Sample Users")
    print("=" * 30)
    
    with Session(engine) as session:
        # Get existing tenant and school
        tenant = session.exec(select(Tenant).where(Tenant.code == "SUPERADMIN")).first()
        school = session.exec(select(School).where(School.tenant_id == tenant.id)).first()
        
        if not tenant or not school:
            print("❌ Tenant or school not found. Please run create_organization.py first.")
            return False
        
        # Sample users data
        users_data = [
            {
                "username": "teacher1",
                "full_name": "John Smith",
                "email": "john.smith@school.com",
                "role": Role.teacher,
                "password": "teacher123"
            },
            {
                "username": "student1", 
                "full_name": "Alice Johnson",
                "email": "alice.johnson@school.com",
                "role": Role.student,
                "password": "student123"
            },
            {
                "username": "parent1",
                "full_name": "Robert Johnson",
                "email": "robert.johnson@school.com", 
                "role": Role.parent,
                "password": "parent123"
            },
            {
                "username": "accountant1",
                "full_name": "Mary Davis",
                "email": "mary.davis@school.com",
                "role": Role.accountant,
                "password": "accountant123"
            },
            {
                "username": "librarian1",
                "full_name": "Sarah Wilson",
                "email": "sarah.wilson@school.com",
                "role": Role.librarian,
                "password": "librarian123"
            }
        ]
        
        created_users = []
        
        for user_data in users_data:
            # Check if user already exists
            existing_user = session.exec(select(User).where(User.username == user_data["username"])).first()
            if existing_user:
                print(f"⚠️  User {user_data['username']} already exists")
                created_users.append(existing_user)
                continue
            
            # Create user
            user = User(
                username=user_data["username"],
                full_name=user_data["full_name"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                tenant_id=tenant.id,
                school_id=school.id
            )
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            created_users.append(user)
            print(f"✅ Created {user_data['role']}: {user_data['username']}")
        
        print(f"\n🎉 Sample users created successfully!")
        print(f"\n🔐 Login Credentials:")
        print("   Teacher: teacher1 / teacher123")
        print("   Student: student1 / student123")
        print("   Parent: parent1 / parent123")
        print("   Accountant: accountant1 / accountant123")
        print("   Librarian: librarian1 / librarian123")
        
        return True

if __name__ == "__main__":
    print("School Management System - Simple Sample Data Creation")
    print("=" * 60)
    
    success = create_sample_users()
    
    if success:
        print("\n✅ Sample data creation completed!")
    else:
        print("\n❌ Sample data creation failed!")
        sys.exit(1)
