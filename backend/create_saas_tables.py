#!/usr/bin/env python3
"""
Database migration script for creating SaaS tables
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db import engine
from app.saas_models import *
from sqlmodel import SQLModel

def create_saas_tables():
    """Create all SaaS tables"""
    
    print("🏢 Creating SaaS Tables")
    print("=" * 30)
    
    try:
        # Create all SaaS tables without foreign key constraints first
        from sqlalchemy import text
        
        # Create tables manually without foreign keys
        with engine.connect() as conn:
            # School Registration Requests table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS school_registration_requests (
                    id SERIAL PRIMARY KEY,
                    school_name VARCHAR NOT NULL,
                    admin_name VARCHAR NOT NULL,
                    admin_email VARCHAR NOT NULL,
                    admin_phone VARCHAR NOT NULL,
                    school_address VARCHAR NOT NULL,
                    school_city VARCHAR NOT NULL,
                    school_state VARCHAR NOT NULL,
                    school_country VARCHAR NOT NULL,
                    school_postal_code VARCHAR NOT NULL,
                    school_phone VARCHAR NOT NULL,
                    school_email VARCHAR NOT NULL,
                    school_website VARCHAR,
                    school_type VARCHAR NOT NULL,
                    student_capacity INTEGER NOT NULL,
                    grades_offered JSON,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR DEFAULT 'pending',
                    approved_date TIMESTAMP,
                    approved_by INTEGER,
                    rejection_reason TEXT,
                    notes TEXT,
                    invitation_token VARCHAR,
                    invitation_expires TIMESTAMP
                )
            """))
            
            # School Invitations table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS school_invitations (
                    id SERIAL PRIMARY KEY,
                    invitation_code VARCHAR UNIQUE NOT NULL,
                    invited_email VARCHAR NOT NULL,
                    invited_by INTEGER,
                    school_name_hint VARCHAR,
                    message TEXT,
                    status VARCHAR DEFAULT 'pending',
                    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    accepted_date TIMESTAMP,
                    expires_date TIMESTAMP NOT NULL,
                    max_uses INTEGER DEFAULT 1,
                    times_used INTEGER DEFAULT 0
                )
            """))
            
            # Plans table (if it doesn't exist in the original file)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS plans (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR UNIQUE NOT NULL,
                    type VARCHAR DEFAULT 'free',
                    description TEXT,
                    price_monthly DECIMAL(10,2) DEFAULT 0.0,
                    price_yearly DECIMAL(10,2) DEFAULT 0.0,
                    max_users INTEGER,
                    max_students INTEGER,
                    max_teachers INTEGER,
                    max_parents INTEGER,
                    features JSON,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            conn.commit()
        
        print("✅ All SaaS tables created successfully!")
        
        # List of created tables
        tables = [
            "school_registration_requests",
            "school_invitations",
            "plans"
        ]
        
        print("\n📋 Created tables:")
        for table in tables:
            print(f"   ✅ {table}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating SaaS tables: {str(e)}")
        return False

def verify_saas_tables():
    """Verify that all SaaS tables were created"""
    
    print("\n🔍 Verifying SaaS Tables")
    print("=" * 35)
    
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        expected_tables = [
            "school_registration_requests",
            "school_invitations",
            "plans"
        ]
        
        missing_tables = []
        for table in expected_tables:
            if table in existing_tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} - MISSING")
                missing_tables.append(table)
        
        if missing_tables:
            print(f"\n❌ Missing tables: {', '.join(missing_tables)}")
            return False
        else:
            print(f"\n✅ All {len(expected_tables)} SaaS tables verified successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error verifying SaaS tables: {str(e)}")
        return False

if __name__ == "__main__":
    print("School Management System - SaaS Tables Migration")
    print("=" * 55)
    
    # Create tables
    success = create_saas_tables()
    
    if success:
        # Verify tables
        verify_success = verify_saas_tables()
        
        if verify_success:
            print("\n🎉 SaaS migration completed successfully!")
            print("SaaS tables are ready for school registration and management.")
        else:
            print("\n⚠️  SaaS migration completed with errors.")
            print("Please check the missing tables above.")
    else:
        print("\n❌ SaaS migration failed!")
        sys.exit(1)
