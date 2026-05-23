#!/usr/bin/env python3
"""
Database migration script for creating all module tables
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db import engine
from app.module_models import *
from sqlmodel import SQLModel

def create_all_tables():
    """Create all module tables"""
    
    print("🗄️  Creating Module Tables")
    print("=" * 50)
    
    try:
        # Create all tables from module models
        SQLModel.metadata.create_all(engine)
        
        print("✅ All module tables created successfully!")
        
        # List of created tables
        tables = [
            "classrooms",
            "students", 
            "teachers",
            "parents",
            "attendance",
            "exams",
            "exam_results",
            "timetable",
            "announcements",
            "direct_messages",
            "fee_structures",
            "fee_invoices",
            "fee_payments",
            "hr_employees",
            "payroll",
            "leave_requests",
            "library_books",
            "library_issues"
        ]
        
        print("\n📋 Created tables:")
        for table in tables:
            print(f"   ✅ {table}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        return False

def verify_tables():
    """Verify that all tables were created"""
    
    print("\n🔍 Verifying Tables")
    print("=" * 30)
    
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        expected_tables = [
            "classrooms",
            "students", 
            "teachers",
            "parents",
            "attendance",
            "exams",
            "exam_results",
            "timetable",
            "announcements",
            "direct_messages",
            "fee_structures",
            "fee_invoices",
            "fee_payments",
            "hr_employees",
            "payroll",
            "leave_requests",
            "library_books",
            "library_issues"
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
            print(f"\n✅ All {len(expected_tables)} tables verified successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Error verifying tables: {str(e)}")
        return False

if __name__ == "__main__":
    print("School Management System - Module Tables Migration")
    print("=" * 60)
    
    # Create tables
    success = create_all_tables()
    
    if success:
        # Verify tables
        verify_success = verify_tables()
        
        if verify_success:
            print("\n🎉 Migration completed successfully!")
            print("All module tables are ready for use.")
        else:
            print("\n⚠️  Migration completed with errors.")
            print("Please check the missing tables above.")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)
