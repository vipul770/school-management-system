from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class Role(str, Enum):
    superadmin = 'superadmin'
    admin = 'admin'
    school = 'school'
    teacher = 'teacher'
    student = 'student'
    parent = 'parent'
    accountant = 'accountant'
    librarian = 'librarian'


class UserBase(SQLModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    tenant_id: Optional[int] = None
    school_id: Optional[int] = None
    role: Role = Role.student
    must_change_password: bool = False


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    hashed_password: str


class UserCreate(UserBase):
    password: str


class Tenant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: Optional[str] = Field(default=None, unique=True, index=True)
    contact_email: Optional[str] = None


class TenantRequestStatus(str, Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'


class TenantRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    contact_email: Optional[str] = None
    requested_by: Optional[int] = Field(default=None, foreign_key='user.id', index=True)
    details: Optional[str] = None
    status: TenantRequestStatus = TenantRequestStatus.pending
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class UserRequestStatus(str, Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'


class UserRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Role = Role.student
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    hashed_password: str
    requested_by: Optional[int] = Field(default=None, foreign_key='user.id', index=True)
    details: Optional[str] = None
    status: UserRequestStatus = UserRequestStatus.pending
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class School(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: Optional[str] = None
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    # relationships omitted for brevity


class ClassRoom(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    class_teacher_user_id: Optional[int] = Field(default=None, foreign_key='user.id', index=True)


class Student(SQLModel, table=True):
    __tablename__ = "user_students"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key='user.id', unique=True, index=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    classroom_id: Optional[int] = Field(default=None, foreign_key='classroom.id', index=True)


class AdmissionStatus(str, Enum):
    submitted = 'submitted'
    under_review = 'under_review'
    approved = 'approved'
    rejected = 'rejected'


class AdmissionsApplication(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    applicant_name: str
    guardian_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    grade_applied: Optional[str] = None
    status: AdmissionStatus = AdmissionStatus.submitted
    submitted_at: Optional[str] = None


class AttendanceStatus(str, Enum):
    present = 'present'
    absent = 'absent'
    late = 'late'
    excused = 'excused'


class AttendanceRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    student_id: Optional[int] = Field(default=None, foreign_key='user_students.id', index=True)
    date: str
    status: AttendanceStatus = AttendanceStatus.present
    remarks: Optional[str] = None


class FeeStatus(str, Enum):
    draft = 'draft'
    issued = 'issued'
    partially_paid = 'partially_paid'
    paid = 'paid'
    overdue = 'overdue'


class FeeInvoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    student_id: Optional[int] = Field(default=None, foreign_key='user_students.id', index=True)
    amount: float
    currency: str = 'USD'
    due_date: Optional[str] = None
    status: FeeStatus = FeeStatus.draft
    description: Optional[str] = None


class FeePayment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    invoice_id: Optional[int] = Field(default=None, foreign_key='feeinvoice.id', index=True)
    amount: float
    payment_date: Optional[str] = None
    reference: Optional[str] = None


class Exam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    name: str
    term: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ExamResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    exam_id: Optional[int] = Field(default=None, foreign_key='exam.id', index=True)
    student_id: Optional[int] = Field(default=None, foreign_key='user_students.id', index=True)
    subject: str
    score: float
    grade: Optional[str] = None


class TimetableEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    class_id: Optional[int] = Field(default=None, foreign_key='classroom.id', index=True)
    subject: str
    teacher_id: Optional[int] = Field(default=None, foreign_key='user.id', index=True)
    day_of_week: str
    start_time: str
    end_time: str


class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    user_id: Optional[int] = Field(default=None, foreign_key='user.id', unique=True, index=True)
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None


class PayrollRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    employee_id: Optional[int] = Field(default=None, foreign_key='employee.id', index=True)
    period_start: str
    period_end: str
    gross_pay: float
    net_pay: float
    paid_date: Optional[str] = None


class LeaveRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    employee_id: Optional[int] = Field(default=None, foreign_key='employee.id', index=True)
    start_date: str
    end_date: str
    reason: Optional[str] = None
    status: str = 'pending'


class TransportRoute(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    name: str
    description: Optional[str] = None


class Vehicle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    registration_no: str = Field(unique=True, index=True)
    capacity: Optional[int] = None
    driver_name: Optional[str] = None


class TransportAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    route_id: Optional[int] = Field(default=None, foreign_key='transportroute.id', index=True)
    vehicle_id: Optional[int] = Field(default=None, foreign_key='vehicle.id', index=True)
    student_id: Optional[int] = Field(default=None, foreign_key='user_students.id', index=True)


class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    name: str
    sku: Optional[str] = None
    quantity: int = 0
    location: Optional[str] = None


class InventoryTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    item_id: Optional[int] = Field(default=None, foreign_key='inventoryitem.id', index=True)
    quantity: int
    transaction_type: str
    transaction_date: Optional[str] = None
    notes: Optional[str] = None


class LibraryBook(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    title: str
    author: Optional[str] = None
    isbn: Optional[str] = None
    copies: int = 1


class LibraryIssue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    book_id: Optional[int] = Field(default=None, foreign_key='librarybook.id', index=True)
    student_id: Optional[int] = Field(default=None, foreign_key='user_students.id', index=True)
    issue_date: str
    due_date: str
    return_date: Optional[str] = None
    fine_amount: Optional[float] = None


class HostelRoom(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    room_no: str
    capacity: int = 1


class HostelAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    room_id: Optional[int] = Field(default=None, foreign_key='hostelroom.id', index=True)
    student_id: Optional[int] = Field(default=None, foreign_key='user_students.id', index=True)
    start_date: str
    end_date: Optional[str] = None


class Announcement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    title: str
    body: str
    posted_at: Optional[str] = None
    posted_by: Optional[int] = Field(default=None, foreign_key='user.id', index=True)


class DirectMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    sender_id: Optional[int] = Field(default=None, foreign_key='user.id', index=True)
    recipient_id: Optional[int] = Field(default=None, foreign_key='user.id', index=True)
    body: str
    sent_at: Optional[str] = None


class MetricSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = Field(default=None, foreign_key='tenant.id', index=True)
    school_id: Optional[int] = Field(default=None, foreign_key='school.id', index=True)
    metric_key: str
    metric_value: float
    captured_at: Optional[str] = None
