#!/usr/bin/env python3
"""
Create sample data for testing the role-based module system
"""

import sys
import os
from datetime import datetime, date, timedelta
import random

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db import engine
from app.models import User, Role, Tenant, School
from app.module_models import (
    Classroom as ModuleClassroom, Student as ModuleStudent, Teacher as ModuleTeacher, 
    Parent as ModuleParent, Attendance as ModuleAttendance, Exam as ModuleExam, 
    ExamResult as ModuleExamResult, TimetableEntry as ModuleTimetableEntry, 
    Announcement as ModuleAnnouncement, DirectMessage as ModuleDirectMessage,
    FeeStructure as ModuleFeeStructure, FeeInvoice as ModuleFeeInvoice, 
    FeePayment as ModuleFeePayment, HREmployee as ModuleHREmployee, 
    Payroll as ModulePayroll, LeaveRequest as ModuleLeaveRequest, 
    LibraryBook as ModuleLibraryBook, LibraryIssue as ModuleLibraryIssue
)
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
        
        return created_users

def create_sample_classrooms(session, school):
    """Create sample classrooms"""
    
    print("\n🏫 Creating Sample Classrooms")
    print("=" * 35)
    
    classrooms_data = [
        {
            "name": "Grade 1-A",
            "grade": "1",
            "section": "A",
            "capacity": 30,
            "room_number": "101",
            "floor": "1",
            "building": "Main Building"
        },
        {
            "name": "Grade 2-B", 
            "grade": "2",
            "section": "B",
            "capacity": 28,
            "room_number": "102",
            "floor": "1",
            "building": "Main Building"
        },
        {
            "name": "Grade 3-A",
            "grade": "3", 
            "section": "A",
            "capacity": 32,
            "room_number": "201",
            "floor": "2",
            "building": "Main Building"
        }
    ]
    
    created_classrooms = []
    
    for classroom_data in classrooms_data:
        classroom = ModuleClassroom(
            **classroom_data,
            tenant_id=school.tenant_id,
            school_id=school.id
        )
        
        session.add(classroom)
        session.commit()
        session.refresh(classroom)
        
        created_classrooms.append(classroom)
        print(f"✅ Created classroom: {classroom.name}")
    
    return created_classrooms

def create_sample_teachers(session, users, school):
    """Create sample teacher profiles"""
    
    print("\n👩‍🏫 Creating Sample Teachers")
    print("=" * 33)
    
    teacher_users = [user for user in users if user.role == Role.teacher]
    created_teachers = []
    
    for i, user in enumerate(teacher_users):
        teacher = ModuleTeacher(
            user_id=user.id,
            employee_id=f"TCH{1000 + i}",
            first_name=user.full_name.split()[0],
            last_name=user.full_name.split()[-1] if len(user.full_name.split()) > 1 else "Smith",
            date_of_birth=date(1980 + i, 1, 1),
            gender="Male",
            phone=f"555-010{i}",
            email=user.email,
            joining_date=date(2020, 8, 1),
            qualification="B.Ed",
            specialization="Mathematics",
            experience_years=5 + i,
            salary=45000 + (i * 2000),
            tenant_id=school.tenant_id,
            school_id=school.id
        )
        
        session.add(teacher)
        session.commit()
        session.refresh(teacher)
        
        created_teachers.append(teacher)
        print(f"✅ Created teacher: {teacher.first_name} {teacher.last_name}")
    
    return created_teachers

def create_sample_students(session, users, classrooms, school):
    """Create sample student profiles"""
    
    print("\n👨‍🎓 Creating Sample Students")
    print("=" * 33)
    
    student_users = [user for user in users if user.role == Role.student]
    parent_users = [user for user in users if user.role == Role.parent]
    
    created_students = []
    
    for i, user in enumerate(student_users):
        # Assign to first classroom for simplicity
        classroom = classrooms[0] if classrooms else None
        
        student = ModuleStudent(
            user_id=user.id,
            student_id=f"STU{2000 + i}",
            first_name=user.full_name.split()[0],
            last_name=user.full_name.split()[-1] if len(user.full_name.split()) > 1 else "Johnson",
            date_of_birth=date(2010 + i, 6, 15),
            gender="Female",
            blood_group="O+",
            address=f"123 School St, City {i}",
            phone=f"555-020{i}",
            email=user.email,
            admission_date=date(2022, 8, 15),
            roll_number=f"R{100 + i}",
            classroom_id=classroom.id if classroom else None,
            parent_id=parent_users[0].id if parent_users else None,
            emergency_contact=f"555-999{i}",
            tenant_id=school.tenant_id,
            school_id=school.id
        )
        
        session.add(student)
        session.commit()
        session.refresh(student)
        
        created_students.append(student)
        print(f"✅ Created student: {student.first_name} {student.last_name}")
    
    return created_students

def create_sample_parents(session, users, school):
    """Create sample parent profiles"""
    
    print("\n👨‍👩‍👧‍👦 Creating Sample Parents")
    print("=" * 36)
    
    parent_users = [user for user in users if user.role == Role.parent]
    created_parents = []
    
    for i, user in enumerate(parent_users):
        parent = ModuleParent(
            user_id=user.id,
            parent_id=f"PAR{3000 + i}",
            first_name=user.full_name.split()[0],
            last_name=user.full_name.split()[-1] if len(user.full_name.split()) > 1 else "Johnson",
            phone=f"555-030{i}",
            email=user.email,
            occupation="Engineer",
            relationship_to_student="Father",
            address=f"456 Home Ave, City {i}",
            emergency_contact=f"555-888{i}",
            tenant_id=school.tenant_id,
            school_id=school.id
        )
        
        session.add(parent)
        session.commit()
        session.refresh(parent)
        
        created_parents.append(parent)
        print(f"✅ Created parent: {parent.first_name} {parent.last_name}")
    
    return created_parents

def create_sample_library_books(session, school):
    """Create sample library books"""
    
    print("\n📚 Creating Sample Library Books")
    print("=" * 37)
    
    books_data = [
        {
            "title": "Mathematics for Beginners",
            "author": "John Doe",
            "isbn": "978-0123456789",
            "publisher": "Education Press",
            "publication_year": 2020,
            "category": "Mathematics",
            "subcategory": "Algebra",
            "total_copies": 5,
            "location": "Shelf A1"
        },
        {
            "title": "Science Adventures",
            "author": "Jane Smith",
            "isbn": "978-0123456790",
            "publisher": "Science Publishers",
            "publication_year": 2021,
            "category": "Science",
            "subcategory": "Physics",
            "total_copies": 3,
            "location": "Shelf B2"
        },
        {
            "title": "History of the World",
            "author": "Robert Brown",
            "isbn": "978-0123456791",
            "publisher": "History Press",
            "publication_year": 2019,
            "category": "History",
            "subcategory": "World History",
            "total_copies": 4,
            "location": "Shelf C3"
        }
    ]
    
    created_books = []
    
    for book_data in books_data:
        book = ModuleLibraryBook(
            **book_data,
            tenant_id=school.tenant_id,
            school_id=school.id
        )
        
        session.add(book)
        session.commit()
        session.refresh(book)
        
        created_books.append(book)
        print(f"✅ Created book: {book.title}")
    
    return created_books

def create_sample_announcements(session, users, school):
    """Create sample announcements"""
    
    print("\n📢 Creating Sample Announcements")
    print("=" * 37)
    
    announcements_data = [
        {
            "title": "Welcome Back to School",
            "content": "We are excited to welcome all students back for the new academic year. Classes will begin as scheduled.",
            "announcement_type": "general",
            "target_audience": "all",
            "author_id": users[0].id,  # First user (superadmin)
            "publish_date": datetime.utcnow(),
            "priority": "high"
        },
        {
            "title": "Parent-Teacher Meeting",
            "content": "Parent-teacher meetings will be held next week. Please check the schedule for your assigned time.",
            "announcement_type": "event",
            "target_audience": "parents",
            "author_id": users[0].id,
            "publish_date": datetime.utcnow(),
            "priority": "normal"
        }
    ]
    
    created_announcements = []
    
    for announcement_data in announcements_data:
        announcement = ModuleAnnouncement(
            **announcement_data,
            tenant_id=school.tenant_id,
            school_id=school.id
        )
        
        session.add(announcement)
        session.commit()
        session.refresh(announcement)
        
        created_announcements.append(announcement)
        print(f"✅ Created announcement: {announcement.title}")
    
    return created_announcements

def main():
    """Main function to create all sample data"""
    
    print("School Management System - Sample Data Creation")
    print("=" * 55)
    
    try:
        with Session(engine) as session:
            # Create sample users
            users = create_sample_users()
            
            if not users:
                print("❌ Failed to create users")
                return False
            
            # Get school info
            tenant = session.exec(select(Tenant).where(Tenant.code == "SUPERADMIN")).first()
            school = session.exec(select(School).where(School.tenant_id == tenant.id)).first()
            
            # Create sample data
            classrooms = create_sample_classrooms(session, school)
            teachers = create_sample_teachers(session, users, school)
            students = create_sample_students(session, users, classrooms, school)
            parents = create_sample_parents(session, users, school)
            books = create_sample_library_books(session, school)
            announcements = create_sample_announcements(session, users, school)
            
            print("\n🎉 Sample data creation completed!")
            print(f"   Users: {len(users)}")
            print(f"   Classrooms: {len(classrooms)}")
            print(f"   Teachers: {len(teachers)}")
            print(f"   Students: {len(students)}")
            print(f"   Parents: {len(parents)}")
            print(f"   Books: {len(books)}")
            print(f"   Announcements: {len(announcements)}")
            
            print("\n🔐 Login Credentials:")
            print("   Teacher: teacher1 / teacher123")
            print("   Student: student1 / student123")
            print("   Parent: parent1 / parent123")
            print("   Accountant: accountant1 / accountant123")
            print("   Librarian: librarian1 / librarian123")
            
            return True
            
    except Exception as e:
        print(f"❌ Error creating sample data: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
