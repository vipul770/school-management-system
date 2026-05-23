"""
Database models for all modules in the School Management System
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
from sqlalchemy import Column, JSON

# Base models
class BaseModel(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    tenant_id: Optional[int] = Field(foreign_key="tenant.id")
    school_id: Optional[int] = Field(foreign_key="school.id")

# Academic Models
class Classroom(BaseModel, table=True):
    __tablename__ = "classrooms"
    
    name: str = Field(index=True)
    grade: str
    section: str
    capacity: int = Field(default=30)
    room_number: str
    floor: str
    building: str
    description: Optional[str] = None
    status: str = Field(default="active")  # active, inactive, maintenance
    
    # Relationships
    students: List["Student"] = Relationship(back_populates="classroom")
    teachers: List["Teacher"] = Relationship(back_populates="classroom")
    timetable_entries: List["TimetableEntry"] = Relationship(back_populates="classroom")

class Student(BaseModel, table=True):
    __tablename__ = "students"
    
    user_id: int = Field(foreign_key="user.id")
    student_id: str = Field(unique=True, index=True)
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str] = None
    address: str
    phone: str
    email: str
    admission_date: date
    roll_number: str
    classroom_id: Optional[int] = Field(foreign_key="classrooms.id")
    parent_id: Optional[int] = Field(foreign_key="parents.id")
    emergency_contact: str
    medical_conditions: Optional[str] = None
    status: str = Field(default="active")  # active, graduated, suspended, withdrawn
    
    # Relationships
    user: "User" = Relationship(back_populates="student_profile")
    classroom: Optional[Classroom] = Relationship(back_populates="students")
    parent: Optional["Parent"] = Relationship(back_populates="children")
    attendance_records: List["Attendance"] = Relationship(back_populates="student")
    exam_results: List["ExamResult"] = Relationship(back_populates="student")
    fee_invoices: List["FeeInvoice"] = Relationship(back_populates="student")

class Teacher(BaseModel, table=True):
    __tablename__ = "teachers"
    
    user_id: int = Field(foreign_key="user.id")
    employee_id: str = Field(unique=True, index=True)
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    email: str
    joining_date: date
    qualification: str
    specialization: str
    experience_years: int = Field(default=0)
    salary: float
    classroom_id: Optional[int] = Field(foreign_key="classrooms.id")
    subjects: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    status: str = Field(default="active")  # active, inactive, on_leave
    
    # Relationships
    user: "User" = Relationship(back_populates="teacher_profile")
    classroom: Optional[Classroom] = Relationship(back_populates="teachers")
    attendance_records: List["Attendance"] = Relationship(back_populates="teacher")
    timetable_entries: List["TimetableEntry"] = Relationship(back_populates="teacher")

class Parent(BaseModel, table=True):
    __tablename__ = "parents"
    
    user_id: int = Field(foreign_key="user.id")
    parent_id: str = Field(unique=True, index=True)
    first_name: str
    last_name: str
    phone: str
    email: str
    occupation: str
    relationship_to_student: str
    address: str
    emergency_contact: str
    status: str = Field(default="active")
    
    # Relationships
    user: "User" = Relationship(back_populates="parent_profile")
    children: List[Student] = Relationship(back_populates="parent")

# Attendance Models
class Attendance(BaseModel, table=True):
    __tablename__ = "attendance"
    
    student_id: int = Field(foreign_key="students.id")
    teacher_id: int = Field(foreign_key="teachers.id")
    date: date
    status: str  # present, absent, late, excused
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    notes: Optional[str] = None
    
    # Relationships
    student: Student = Relationship(back_populates="attendance_records")
    teacher: Teacher = Relationship(back_populates="attendance_records")

# Exam Models
class Exam(BaseModel, table=True):
    __tablename__ = "exams"
    
    title: str
    description: Optional[str] = None
    exam_type: str  # midterm, final, quiz, assignment
    subject: str
    class_id: Optional[int] = Field(foreign_key="classrooms.id")
    teacher_id: int = Field(foreign_key="teachers.id")
    start_date: datetime
    end_date: datetime
    duration_minutes: int
    total_marks: float
    passing_marks: float
    status: str = Field(default="upcoming")  # upcoming, ongoing, completed, cancelled
    
    # Relationships
    classroom: Optional[Classroom] = Relationship(back_populates="exams")
    teacher: Teacher = Relationship(back_populates="exams")
    results: List["ExamResult"] = Relationship(back_populates="exam")

class ExamResult(BaseModel, table=True):
    __tablename__ = "exam_results"
    
    exam_id: int = Field(foreign_key="exams.id")
    student_id: int = Field(foreign_key="students.id")
    marks_obtained: float
    percentage: float
    grade: str
    remarks: Optional[str] = None
    submitted_at: Optional[datetime] = None
    
    # Relationships
    exam: Exam = Relationship(back_populates="results")
    student: Student = Relationship(back_populates="exam_results")

# Timetable Models
class TimetableEntry(BaseModel, table=True):
    __tablename__ = "timetable"
    
    classroom_id: int = Field(foreign_key="classroom.id")
    teacher_id: int = Field(foreign_key="teachers.id")
    subject: str
    day_of_week: int  # 0-6 (Monday to Sunday)
    start_time: str  # HH:MM format
    end_time: str    # HH:MM format
    room_number: str
    semester: str
    academic_year: str
    status: str = Field(default="active")
    
    # Relationships
    classroom: Classroom = Relationship(back_populates="timetable_entries")
    teacher: Teacher = Relationship(back_populates="timetable_entries")

# Announcement Models
class Announcement(BaseModel, table=True):
    __tablename__ = "announcements"
    
    title: str
    content: str
    announcement_type: str  # general, exam, holiday, event, urgent
    target_audience: str    # all, students, teachers, parents, specific_class
    target_class_id: Optional[int] = Field(foreign_key="classroom.id")
    author_id: int = Field(foreign_key="user.id")
    publish_date: datetime
    expiry_date: Optional[datetime] = None
    priority: str = Field(default="normal")  # low, normal, high, urgent
    status: str = Field(default="published")  # draft, published, archived
    
    # Relationships
    author: "User" = Relationship(back_populates="announcements")
    target_class: Optional[Classroom] = Relationship()

# Messaging Models
class DirectMessage(BaseModel, table=True):
    __tablename__ = "direct_messages"
    
    sender_id: int = Field(foreign_key="user.id")
    receiver_id: int = Field(foreign_key="user.id")
    subject: str
    message: str
    message_type: str  # text, file, image
    attachment_url: Optional[str] = None
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None
    parent_message_id: Optional[int] = Field(foreign_key="direct_messages.id")
    status: str = Field(default="sent")  # sent, delivered, read
    
    # Relationships
    sender: "User" = Relationship(back_populates="sent_messages")
    receiver: "User" = Relationship(back_populates="received_messages")
    parent_message: Optional["DirectMessage"] = Relationship()
    replies: List["DirectMessage"] = Relationship(back_populates="parent_message")

# Fee Management Models
class FeeStructure(BaseModel, table=True):
    __tablename__ = "fee_structures"
    
    name: str
    description: Optional[str] = None
    grade: str
    academic_year: str
    tuition_fee: float
    transport_fee: float = Field(default=0)
    lab_fee: float = Field(default=0)
    library_fee: float = Field(default=0)
    sports_fee: float = Field(default=0)
    other_fees: float = Field(default=0)
    total_fee: float
    due_date: date
    status: str = Field(default="active")

class FeeInvoice(BaseModel, table=True):
    __tablename__ = "fee_invoices"
    
    student_id: int = Field(foreign_key="students.id")
    invoice_number: str = Field(unique=True, index=True)
    fee_structure_id: int = Field(foreign_key="fee_structures.id")
    month: str
    academic_year: str
    amount_due: float
    amount_paid: float = Field(default=0)
    balance: float
    due_date: date
    issue_date: date = Field(default_factory=date.today)
    status: str = Field(default="pending")  # pending, partially_paid, paid, overdue
    
    # Relationships
    student: Student = Relationship(back_populates="fee_invoices")
    fee_structure: FeeStructure = Relationship()
    payments: List["FeePayment"] = Relationship(back_populates="invoice")

class FeePayment(BaseModel, table=True):
    __tablename__ = "fee_payments"
    
    invoice_id: int = Field(foreign_key="fee_invoices.id")
    payment_method: str  # cash, card, bank_transfer, online
    amount: float
    payment_date: datetime = Field(default_factory=datetime.utcnow)
    transaction_id: Optional[str] = None
    receipt_number: str = Field(unique=True, index=True)
    notes: Optional[str] = None
    status: str = Field(default="completed")  # pending, completed, failed, refunded
    
    # Relationships
    invoice: FeeInvoice = Relationship(back_populates="payments")

# HR Models
class HREmployee(BaseModel, table=True):
    __tablename__ = "hr_employees"
    
    user_id: int = Field(foreign_key="user.id")
    employee_id: str = Field(unique=True, index=True)
    department: str
    position: str
    employment_type: str  # full_time, part_time, contract
    reporting_manager_id: Optional[int] = Field(foreign_key="hr_employees.id")
    work_location: str
    work_schedule: str
    status: str = Field(default="active")
    
    # Relationships
    user: "User" = Relationship(back_populates="hr_profile")
    reporting_manager: Optional["HREmployee"] = Relationship()
    subordinates: List["HREmployee"] = Relationship(back_populates="reporting_manager")
    payroll_records: List["Payroll"] = Relationship(back_populates="employee")
    leave_requests: List["LeaveRequest"] = Relationship(back_populates="employee")

class Payroll(BaseModel, table=True):
    __tablename__ = "payroll"
    
    employee_id: int = Field(foreign_key="hr_employees.id")
    month: str
    year: int
    basic_salary: float
    allowances: float = Field(default=0)
    deductions: float = Field(default=0)
    overtime: float = Field(default=0)
    bonus: float = Field(default=0)
    net_salary: float
    pay_date: date
    payment_method: str
    status: str = Field(default="processed")  # pending, processed, paid
    
    # Relationships
    employee: HREmployee = Relationship(back_populates="payroll_records")

class LeaveRequest(BaseModel, table=True):
    __tablename__ = "leave_requests"
    
    employee_id: int = Field(foreign_key="hr_employees.id")
    leave_type: str  # sick, casual, annual, maternity, paternity
    start_date: date
    end_date: date
    total_days: int
    reason: str
    status: str = Field(default="pending")  # pending, approved, rejected, cancelled
    approved_by: Optional[int] = Field(foreign_key="hr_employees.id")
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Relationships
    employee: HREmployee = Relationship(back_populates="leave_requests")
    approver: Optional["HREmployee"] = Relationship()

# Library Models
class LibraryBook(BaseModel, table=True):
    __tablename__ = "library_books"
    
    title: str
    author: str
    isbn: str = Field(unique=True, index=True)
    publisher: str
    publication_year: int
    category: str
    subcategory: str
    total_copies: int = Field(default=1)
    available_copies: int = Field(default=1)
    location: str  # shelf, rack, section
    description: Optional[str] = None
    status: str = Field(default="available")  # available, unavailable, maintenance
    
    # Relationships
    issues: List["LibraryIssue"] = Relationship(back_populates="book")

class LibraryIssue(BaseModel, table=True):
    __tablename__ = "library_issues"
    
    book_id: int = Field(foreign_key="library_books.id")
    user_id: int = Field(foreign_key="user.id")
    issue_date: date = Field(default_factory=date.today)
    due_date: date
    return_date: Optional[date] = None
    status: str = Field(default="issued")  # issued, returned, overdue, lost
    fine_amount: float = Field(default=0)
    fine_paid: bool = Field(default=False)
    notes: Optional[str] = None
    
    # Relationships
    book: LibraryBook = Relationship(back_populates="issues")
    user: "User" = Relationship(back_populates="library_issues")

# Update User model to include relationships
from .models import User

# Add relationships to User model (these would be added to the existing User model)
class User(BaseModel, table=True):
    __tablename__ = "users"
    
    # Existing fields...
    username: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str
    email: str
    role: str
    tenant_id: Optional[int] = Field(foreign_key="tenant.id")
    school_id: Optional[int] = Field(foreign_key="school.id")
    
    # New relationships
    student_profile: Optional[Student] = Relationship(back_populates="user")
    teacher_profile: Optional[Teacher] = Relationship(back_populates="user")
    parent_profile: Optional[Parent] = Relationship(back_populates="user")
    hr_profile: Optional[HREmployee] = Relationship(back_populates="user")
    announcements: List[Announcement] = Relationship(back_populates="author")
    sent_messages: List[DirectMessage] = Relationship(back_populates="sent_messages")
    received_messages: List[DirectMessage] = Relationship(back_populates="received_messages")
    library_issues: List[LibraryIssue] = Relationship(back_populates="user")
