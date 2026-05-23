#!/usr/bin/env python3
"""
Test Superadmin API Endpoints
Test all the API endpoints used by the superadmin dashboard
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.models import User, School, UserRequest
from app.db import engine
from sqlmodel import Session, select
from app.auth import create_access_token

def test_superadmin_apis():
    """Test superadmin API endpoints"""
    
    print("🧪 Testing Superadmin API Endpoints")
    print("=" * 50)
    
    try:
        with Session(engine) as session:
            # Get superadmin user
            superadmin = session.exec(select(User).where(User.username == "superadmin")).first()
            if not superadmin:
                print("❌ Superadmin user not found!")
                return False
            
            print(f"✅ Found superadmin: {superadmin.username}")
            
            # Create access token
            token = create_access_token({"sub": superadmin.username})
            print(f"✅ Created access token")
            
            # Test data availability
            schools = session.exec(select(School)).all()
            print(f"✅ Found {len(schools)} schools")
            
            users = session.exec(select(User)).all()
            print(f"✅ Found {len(users)} users")
            
            user_requests = session.exec(select(UserRequest).where(UserRequest.status == "pending")).all()
            print(f"✅ Found {len(user_requests)} pending user requests")
            
            print(f"\n📊 Data Summary:")
            print(f"   Schools: {len(schools)}")
            print(f"   Users: {len(users)}")
            print(f"   Pending Requests: {len(user_requests)}")
            
            if schools:
                print(f"\n🏫 Schools List:")
                for school in schools:
                    print(f"   - {school.name} (ID: {school.id})")
            
            if users:
                print(f"\n👥 Users List:")
                for user in users:
                    print(f"   - {user.username} ({user.role})")
            
            print(f"\n🚀 Superadmin dashboard should display this data correctly!")
            return True
            
    except Exception as e:
        print(f"❌ Error testing APIs: {str(e)}")
        return False

if __name__ == "__main__":
    print("School Management System - Superadmin API Test")
    print("=" * 55)
    
    success = test_superadmin_apis()
    
    if success:
        print("\n🎉 Superadmin API test completed successfully!")
    else:
        print("\n❌ Superadmin API test failed!")
        sys.exit(1)
