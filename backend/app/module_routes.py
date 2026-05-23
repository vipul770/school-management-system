"""
API routes for all modules with role-based access control
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, date

from .db import get_session
from .models import User
from .auth import get_current_user
from .module_models import (
    Classroom, Student, Teacher, Parent, Attendance, Exam, 
    ExamResult, TimetableEntry, Announcement, DirectMessage,
    FeeStructure, FeeInvoice, FeePayment, HREmployee, 
    Payroll, LeaveRequest, LibraryBook, LibraryIssue
)
from .middleware import (
    can_read_classrooms, can_write_classrooms,
    can_read_students, can_write_students,
    can_read_attendance, can_write_attendance,
    can_read_exams, can_write_exams,
    can_read_fee_invoices, can_write_fee_invoices,
    can_read_library_books, can_write_library_books,
    ModuleAccessChecker
)
from .permissions import Module

# Create a simple router for the permissions endpoint
permissions_router = APIRouter(prefix="/user", tags=["User Permissions"])

# Create routers for each module
classrooms_router = APIRouter(prefix="/classrooms", tags=["Classrooms"])
students_router = APIRouter(prefix="/students", tags=["Students"])
teachers_router = APIRouter(prefix="/teachers", tags=["Teachers"])
attendance_router = APIRouter(prefix="/attendance", tags=["Attendance"])
exams_router = APIRouter(prefix="/exams", tags=["Exams"])
timetable_router = APIRouter(prefix="/timetable", tags=["Timetable"])
announcements_router = APIRouter(prefix="/announcements", tags=["Announcements"])
messages_router = APIRouter(prefix="/messages", tags=["Messages"])
fee_router = APIRouter(prefix="/fees", tags=["Fees"])
hr_router = APIRouter(prefix="/hr", tags=["HR"])
library_router = APIRouter(prefix="/library", tags=["Library"])

# ============= CLASSROOMS =============
@classrooms_router.get("/", response_model=List[Classroom])
def list_classrooms(
    current_user: User = Depends(can_read_classrooms),
    session: Session = Depends(get_session),
    school_id: Optional[int] = None
):
    """List all classrooms"""
    query = select(Classroom)
    
    # Filter by school access
    if current_user.role != 'superadmin':
        query = query.where(Classroom.school_id == current_user.school_id)
    elif school_id:
        query = query.where(Classroom.school_id == school_id)
    
    return session.exec(query).all()

@classrooms_router.post("/", response_model=Classroom)
def create_classroom(
    classroom: Classroom,
    current_user: User = Depends(can_write_classrooms),
    session: Session = Depends(get_session)
):
    """Create a new classroom"""
    if current_user.role not in ['superadmin', 'school', 'admin']:
        classroom.school_id = current_user.school_id
    
    session.add(classroom)
    session.commit()
    session.refresh(classroom)
    return classroom

@classrooms_router.get("/{classroom_id}", response_model=Classroom)
def get_classroom(
    classroom_id: int,
    current_user: User = Depends(can_read_classrooms),
    session: Session = Depends(get_session)
):
    """Get specific classroom"""
    classroom = session.get(Classroom, classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    # Check access
    if current_user.role not in ['superadmin', 'school'] and classroom.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return classroom

@classrooms_router.put("/{classroom_id}", response_model=Classroom)
def update_classroom(
    classroom_id: int,
    classroom_update: dict,
    current_user: User = Depends(can_write_classrooms),
    session: Session = Depends(get_session)
):
    """Update classroom"""
    classroom = session.get(Classroom, classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    # Check access
    if current_user.role not in ['superadmin', 'school'] and classroom.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in classroom_update.items():
        if hasattr(classroom, key):
            setattr(classroom, key, value)
    
    classroom.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(classroom)
    return classroom

# ============= STUDENTS =============
@students_router.get("/", response_model=List[Student])
def list_students(
    current_user: User = Depends(can_read_students),
    session: Session = Depends(get_session),
    classroom_id: Optional[int] = None,
    school_id: Optional[int] = None
):
    """List all students"""
    query = select(Student)
    
    # Filter by role access
    if current_user.role == 'student':
        query = query.where(Student.user_id == current_user.id)
    elif current_user.role == 'parent':
        # Parents can see their children
        parent = session.exec(select(Parent).where(Parent.user_id == current_user.id)).first()
        if parent:
            query = query.where(Student.parent_id == parent.id)
        else:
            return []
    elif current_user.role != 'superadmin':
        query = query.where(Student.school_id == current_user.school_id)
    
    if classroom_id:
        query = query.where(Student.classroom_id == classroom_id)
    if school_id and current_user.role == 'superadmin':
        query = query.where(Student.school_id == school_id)
    
    return session.exec(query).all()

@students_router.post("/", response_model=Student)
def create_student(
    student: Student,
    current_user: User = Depends(can_write_students),
    session: Session = Depends(get_session)
):
    """Create a new student"""
    if current_user.role not in ['superadmin', 'school', 'admin']:
        student.school_id = current_user.school_id
    
    # Generate student ID
    if not student.student_id:
        student.student_id = f"STU{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@students_router.get("/{student_id}", response_model=Student)
def get_student(
    student_id: int,
    current_user: User = Depends(can_read_students),
    session: Session = Depends(get_session)
):
    """Get specific student"""
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check access
    if current_user.role == 'student' and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == 'parent':
        parent = session.exec(select(Parent).where(Parent.user_id == current_user.id)).first()
        if not parent or student.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ['superadmin', 'school'] and student.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return student

# ============= TEACHERS =============
@teachers_router.get("/", response_model=List[Teacher])
def list_teachers(
    current_user: User = Depends(can_read_classrooms),
    session: Session = Depends(get_session),
    school_id: Optional[int] = None
):
    """List all teachers"""
    query = select(Teacher)
    
    # Filter by role access
    if current_user.role != 'superadmin':
        query = query.where(Teacher.school_id == current_user.school_id)
    elif school_id:
        query = query.where(Teacher.school_id == school_id)
    
    return session.exec(query).all()

@teachers_router.post("/", response_model=Teacher)
def create_teacher(
    teacher: Teacher,
    current_user: User = Depends(can_write_classrooms),
    session: Session = Depends(get_session)
):
    """Create a new teacher"""
    if current_user.role not in ['superadmin', 'school', 'admin']:
        teacher.school_id = current_user.school_id
    
    # Generate employee ID
    if not teacher.employee_id:
        teacher.employee_id = f"TCH{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    return teacher

# ============= ATTENDANCE =============
@attendance_router.get("/", response_model=List[Attendance])
def list_attendance(
    current_user: User = Depends(can_read_attendance),
    session: Session = Depends(get_session),
    date: Optional[date] = None,
    student_id: Optional[int] = None,
    classroom_id: Optional[int] = None
):
    """List attendance records"""
    query = select(Attendance)
    
    # Filter by role access
    if current_user.role == 'student':
        # Students can only see their own attendance
        student = session.exec(select(Student).where(Student.user_id == current_user.id)).first()
        if student:
            query = query.where(Attendance.student_id == student.id)
        else:
            return []
    elif current_user.role == 'parent':
        # Parents can see their children's attendance
        parent = session.exec(select(Parent).where(Parent.user_id == current_user.id)).first()
        if parent:
            children = session.exec(select(Student).where(Student.parent_id == parent.id)).all()
            child_ids = [child.id for child in children]
            if child_ids:
                query = query.where(Attendance.student_id.in_(child_ids))
            else:
                return []
        else:
            return []
    elif current_user.role == 'teacher':
        # Teachers can see attendance for their classroom
        teacher = session.exec(select(Teacher).where(Teacher.user_id == current_user.id)).first()
        if teacher and teacher.classroom_id:
            students = session.exec(select(Student).where(Student.classroom_id == teacher.classroom_id)).all()
            student_ids = [student.id for student in students]
            if student_ids:
                query = query.where(Attendance.student_id.in_(student_ids))
            else:
                return []
        else:
            return []
    elif current_user.role not in ['superadmin', 'school']:
        query = query.where(Attendance.student_id == -1)  # No access
    
    if date:
        query = query.where(Attendance.date == date)
    if student_id:
        query = query.where(Attendance.student_id == student_id)
    if classroom_id:
        students = session.exec(select(Student).where(Student.classroom_id == classroom_id)).all()
        student_ids = [student.id for student in students]
        if student_ids:
            query = query.where(Attendance.student_id.in_(student_ids))
    
    return session.exec(query).all()

@attendance_router.post("/", response_model=Attendance)
def mark_attendance(
    attendance: Attendance,
    current_user: User = Depends(can_write_attendance),
    session: Session = Depends(get_session)
):
    """Mark attendance"""
    # Teachers can only mark attendance for their classroom
    if current_user.role == 'teacher':
        teacher = session.exec(select(Teacher).where(Teacher.user_id == current_user.id)).first()
        if teacher and teacher.classroom_id:
            student = session.get(Student, attendance.student_id)
            if student and student.classroom_id != teacher.classroom_id:
                raise HTTPException(status_code=403, detail="Can only mark attendance for your classroom")
        else:
            raise HTTPException(status_code=403, detail="No classroom assigned")
    
    session.add(attendance)
    session.commit()
    session.refresh(attendance)
    return attendance

# ============= EXAMS =============
@exams_router.get("/", response_model=List[Exam])
def list_exams(
    current_user: User = Depends(can_read_exams),
    session: Session = Depends(get_session),
    classroom_id: Optional[int] = None
):
    """List all exams"""
    query = select(Exam)
    
    # Filter by role access
    if current_user.role == 'student':
        # Students can see exams for their classroom
        student = session.exec(select(Student).where(Student.user_id == current_user.id)).first()
        if student and student.classroom_id:
            query = query.where(Exam.class_id == student.classroom_id)
        else:
            return []
    elif current_user.role == 'teacher':
        # Teachers can see exams they created or for their classroom
        teacher = session.exec(select(Teacher).where(Teacher.user_id == current_user.id)).first()
        if teacher:
            if teacher.classroom_id:
                query = query.where(
                    (Exam.teacher_id == teacher.id) | 
                    (Exam.class_id == teacher.classroom_id)
                )
            else:
                query = query.where(Exam.teacher_id == teacher.id)
        else:
            return []
    elif current_user.role not in ['superadmin', 'school']:
        query = query.where(Exam.teacher_id == -1)  # No access
    
    if classroom_id:
        query = query.where(Exam.class_id == classroom_id)
    
    return session.exec(query).all()

@exams_router.post("/", response_model=Exam)
def create_exam(
    exam: Exam,
    current_user: User = Depends(can_write_exams),
    session: Session = Depends(get_session)
):
    """Create a new exam"""
    # Teachers can only create exams for their classroom
    if current_user.role == 'teacher':
        teacher = session.exec(select(Teacher).where(Teacher.user_id == current_user.id)).first()
        if teacher:
            exam.teacher_id = teacher.id
            if not exam.class_id and teacher.classroom_id:
                exam.class_id = teacher.classroom_id
        else:
            raise HTTPException(status_code=403, detail="Teacher profile not found")
    
    session.add(exam)
    session.commit()
    session.refresh(exam)
    return exam

# ============= FEE MANAGEMENT =============
@fee_router.get("/invoices", response_model=List[FeeInvoice])
def list_fee_invoices(
    current_user: User = Depends(can_read_fee_invoices),
    session: Session = Depends(get_session),
    student_id: Optional[int] = None
):
    """List fee invoices"""
    query = select(FeeInvoice)
    
    # Filter by role access
    if current_user.role == 'student':
        # Students can see their own invoices
        student = session.exec(select(Student).where(Student.user_id == current_user.id)).first()
        if student:
            query = query.where(FeeInvoice.student_id == student.id)
        else:
            return []
    elif current_user.role == 'parent':
        # Parents can see their children's invoices
        parent = session.exec(select(Parent).where(Parent.user_id == current_user.id)).first()
        if parent:
            children = session.exec(select(Student).where(Student.parent_id == parent.id)).all()
            child_ids = [child.id for child in children]
            if child_ids:
                query = query.where(FeeInvoice.student_id.in_(child_ids))
            else:
                return []
        else:
            return []
    elif current_user.role not in ['superadmin', 'school', 'accountant']:
        query = query.where(FeeInvoice.student_id == -1)  # No access
    
    if student_id:
        query = query.where(FeeInvoice.student_id == student_id)
    
    return session.exec(query).all()

@fee_router.post("/invoices", response_model=FeeInvoice)
def create_fee_invoice(
    invoice: FeeInvoice,
    current_user: User = Depends(can_write_fee_invoices),
    session: Session = Depends(get_session)
):
    """Create a new fee invoice"""
    # Generate invoice number
    if not invoice.invoice_number:
        invoice.invoice_number = f"INV{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice

# ============= LIBRARY =============
@library_router.get("/books", response_model=List[LibraryBook])
def list_library_books(
    current_user: User = Depends(can_read_library_books),
    session: Session = Depends(get_session),
    category: Optional[str] = None,
    available_only: bool = False
):
    """List library books"""
    query = select(LibraryBook)
    
    if category:
        query = query.where(LibraryBook.category == category)
    
    if available_only:
        query = query.where(LibraryBook.available_copies > 0)
    
    return session.exec(query).all()

@library_router.post("/books", response_model=LibraryBook)
def create_library_book(
    book: LibraryBook,
    current_user: User = Depends(can_write_library_books),
    session: Session = Depends(get_session)
):
    """Add a new library book"""
    session.add(book)
    session.commit()
    session.refresh(book)
    return book

@library_router.post("/issues", response_model=LibraryIssue)
def issue_book(
    issue: LibraryIssue,
    current_user: User = Depends(can_write_library_books),
    session: Session = Depends(get_session)
):
    """Issue a library book"""
    book = session.get(LibraryBook, issue.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="No copies available")
    
    # Update available copies
    book.available_copies -= 1
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    return issue

@library_router.put("/issues/{issue_id}/return")
def return_book(
    issue_id: int,
    current_user: User = Depends(can_write_library_books),
    session: Session = Depends(get_session)
):
    """Return a library book"""
    issue = session.get(LibraryIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue record not found")
    
    if issue.status != 'issued':
        raise HTTPException(status_code=400, detail="Book already returned")
    
    # Update book availability
    book = session.get(LibraryBook, issue.book_id)
    if book:
        book.available_copies += 1
    
    issue.status = 'returned'
    issue.return_date = date.today()
    
    session.commit()
    session.refresh(issue)
    return issue

# ============= TIMETABLE =============
@timetable_router.get("/", response_model=List[TimetableEntry])
def list_timetable(
    current_user: User = Depends(can_read_classrooms),
    session: Session = Depends(get_session),
    classroom_id: Optional[int] = None,
    teacher_id: Optional[int] = None
):
    """List timetable entries"""
    query = select(TimetableEntry)
    
    # Filter by role access
    if current_user.role != 'superadmin':
        query = query.where(TimetableEntry.school_id == current_user.school_id)
    
    if classroom_id:
        query = query.where(TimetableEntry.class_id == classroom_id)
    if teacher_id:
        query = query.where(TimetableEntry.teacher_id == teacher_id)
    
    return session.exec(query).all()

@timetable_router.post("/", response_model=TimetableEntry)
def create_timetable_entry(
    entry: TimetableEntry,
    current_user: User = Depends(can_write_classrooms),
    session: Session = Depends(get_session)
):
    """Create a new timetable entry"""
    if current_user.role not in ['superadmin', 'school', 'admin']:
        entry.school_id = current_user.school_id
    
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry

# ============= USER PERMISSIONS ENDPOINT =============
@permissions_router.get("/permissions")
def get_user_permissions(current_user: User = Depends(get_current_user)):
    """Get current user's permissions"""
    return {
        "role": current_user.role,
        "permissions": ModuleAccessChecker.get_user_modules(current_user)
    }

# Export all routers
__all__ = [
    "classrooms_router",
    "students_router", 
    "teachers_router",
    "attendance_router",
    "exams_router",
    "timetable_router",
    "announcements_router",
    "messages_router",
    "fee_router",
    "hr_router",
    "library_router",
    "permissions_router"
]
