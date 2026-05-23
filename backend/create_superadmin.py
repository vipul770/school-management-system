#!/usr/bin/env python3
"""
Create initial superadmin user for the system
"""
 
import sys
import os
 
# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
 
from app.db import engine
from app.models import User, Role, Tenant, School
from app.auth import get_password_hash
from sqlmodel import Session, select
from datetime import datetime
 
def create_superadmin():
    """Create initial superadmin user"""
 
    print("🔐 Creating Superadmin User")
    print("=" * 35)
 
    try:
        with Session(engine) as session:
            # Check if superadmin already exists
            existing_superadmin = session.exec(
                select(User).where(User.username == "superadmin")
            ).first()
 
            if existing_superadmin:
                print("⚠️  Superadmin user already exists!")
                print(f"   Username: {existing_superadmin.username}")
                print(f"   Role: {existing_superadmin.role}")
                return True
 
            # Create superadmin tenant
            superadmin_tenant = Tenant(
                name="Superadmin Organization",
                code="SUPERADMIN",
                domain="superadmin.schoolms.com",
                contact_email="superadmin@schoolms.com"
            )
 
            session.add(superadmin_tenant)
            session.commit()
            session.refresh(superadmin_tenant)
 
            # Create superadmin school
            superadmin_school = School(
                name="Superadmin School",
                tenant_id=superadmin_tenant.id,
                address="System Administration",
                city="Admin City",
                state="Admin State",
                country="Admin Country",
                postal_code="00000",
                phone="000-000-0000",
                email="superadmin@schoolms.com",
                type="administrative",
                student_capacity=0,
                is_active=True
            )
 
            session.add(superadmin_school)
            session.commit()
            session.refresh(superadmin_school)
 
            # Create superadmin user
            superadmin_user = User(
                username="superadmin",
                full_name="System Superadmin",
                email="superadmin@schoolms.com",
                hashed_password=get_password_hash("admin123"),
                role=Role.superadmin,
                tenant_id=superadmin_tenant.id,
                school_id=superadmin_school.id
            )
 
            session.add(superadmin_user)
            session.commit()
            session.refresh(superadmin_user)
 
            print("✅ Superadmin user created successfully!")
            print(f"   Username: superadmin")
            print(f"   Password: admin123")
            print(f"   Role: {superadmin_user.role}")
            print(f"   Tenant: {superadmin_tenant.code}")
            print(f"   School: {superadmin_school.name}")
 
            return True
 
    except Exception as e:
        print(f"❌ Error creating superadmin: {str(e)}")
        return False
 
def create_sample_school_for_testing():
    """Create a sample school for testing the SaaS flow"""
 
    print("\n🏫 Creating Sample School for Testing")
    print("=" * 45)
 
    try:
        with Session(engine) as session:
            # Create sample tenant
            sample_tenant = Tenant(
                name="Sample School",
                code="SAMPLE001",
                domain="sample001.schoolms.com",
                contact_email="admin@sample.com"
            )
 
            session.add(sample_tenant)
            session.commit()
            session.refresh(sample_tenant)
 
            # Create sample school
            sample_school = School(
                name="Sample Elementary School",
                tenant_id=sample_tenant.id,
                address="123 School Street",
                city="Test City",
                state="Test State",
                country="Test Country",
                postal_code="12345",
                phone="555-0123",
                email="info@sample.com",
                type="private",
                student_capacity=500,
                is_active=True
            )
 
            session.add(sample_school)
            session.commit()
            session.refresh(sample_school)
 
            print("✅ Sample school created successfully!")
            print(f"   School Name: {sample_school.name}")
            print(f"   Tenant Code: {sample_tenant.code}")
 
            return True
 
    except Exception as e:
        print(f"❌ Error creating sample school: {str(e)}")
        return False
 
if __name__ == "__main__":
    print("School Management System - Superadmin Setup")
    print("=" * 50)
 
    # Create superadmin
    superadmin_success = create_superadmin()
 
    # Create sample school for testing
    sample_success = create_sample_school_for_testing()
 
    if superadmin_success and sample_success:
        print("\n🎉 Setup completed successfully!")
        print("\n🔐 Login Credentials:")
        print("   Username: superadmin")
        print("   Password: admin123")
        print("\n🌐 Access URLs:")
        print("   Frontend: http://localhost:3001/")
        print("   Backend API: http://localhost:8000/docs")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)