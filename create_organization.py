#!/usr/bin/env python3
"""
Organization Creation Script
Create a valid organization/tenant for superadmin login
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.models import Tenant, School
from app.db import engine
from sqlmodel import Session, select

def create_organization():
    """Create a default organization for superadmin"""
    
    print("🏢 Creating Default Organization")
    print("=" * 40)
    
    try:
        with Session(engine) as session:
            # Check if tenant already exists
            existing_tenant = session.exec(select(Tenant).where(Tenant.code == "SUPERADMIN")).first()
            if existing_tenant:
                print(f"✅ Organization '{existing_tenant.name}' already exists!")
                print(f"   ID: {existing_tenant.id}")
                print(f"   Code: {existing_tenant.code}")
                print(f"   Name: {existing_tenant.name}")
                return existing_tenant.id
            
            # Create tenant
            tenant = Tenant(
                name="SuperAdmin Organization",
                code="SUPERADMIN",
                domain="superadmin.school.com",
                status="active",
                max_users=1000,
                subscription_plan="premium"
            )
            
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
            
            print(f"✅ Tenant created successfully!")
            print(f"   ID: {tenant.id}")
            print(f"   Code: {tenant.code}")
            print(f"   Name: {tenant.name}")
            
            # Create a default school for this tenant
            school = School(
                name="SuperAdmin School",
                address="Admin Headquarters",
                city="Admin City",
                state="Admin State",
                contact_email="admin@school.com",
                contact_phone="+1234567890",
                tenant_id=tenant.id,
                status="active"
            )
            
            session.add(school)
            session.commit()
            session.refresh(school)
            
            print(f"✅ School created successfully!")
            print(f"   School ID: {school.id}")
            print(f"   Name: {school.name}")
            print(f"   Tenant ID: {school.tenant_id}")
            
            print(f"\n🚀 Use Organization ID: {tenant.id} for superadmin login!")
            return tenant.id
            
    except Exception as e:
        print(f"❌ Error creating organization: {str(e)}")
        return None

def create_multiple_organizations():
    """Create multiple test organizations"""
    
    print("🏢 Creating Multiple Test Organizations")
    print("=" * 50)
    
    organizations = [
        {
            "name": "Test Organization 1",
            "code": "TEST1",
            "domain": "test1.school.com"
        },
        {
            "name": "Test Organization 2", 
            "code": "TEST2",
            "domain": "test2.school.com"
        },
        {
            "name": "Demo Organization",
            "code": "DEMO",
            "domain": "demo.school.com"
        }
    ]
    
    try:
        with Session(engine) as session:
            for org_data in organizations:
                # Check if tenant already exists
                existing_tenant = session.exec(select(Tenant).where(Tenant.code == org_data["code"])).first()
                if existing_tenant:
                    print(f"⚠️  Organization '{org_data['code']}' already exists (ID: {existing_tenant.id})")
                    continue
                
                # Create tenant
                tenant = Tenant(
                    name=org_data["name"],
                    code=org_data["code"],
                    domain=org_data["domain"],
                    status="active",
                    max_users=100,
                    subscription_plan="basic"
                )
                
                session.add(tenant)
                session.commit()
                session.refresh(tenant)
                
                print(f"✅ Created organization: {org_data['name']} (ID: {tenant.id})")
            
            print(f"\n🎉 Multiple organizations created successfully!")
            
    except Exception as e:
        print(f"❌ Error creating organizations: {str(e)}")

if __name__ == "__main__":
    print("School Management System - Organization Creation")
    print("=" * 55)
    
    # Create default organization
    default_org_id = create_organization()
    
    print("\n" + "=" * 55)
    
    # Create additional test organizations
    create_multiple_organizations()
    
    if default_org_id:
        print(f"\n🎯 Primary Organization ID for Superadmin: {default_org_id}")
        print("Use this ID on the login page for superadmin access.")
