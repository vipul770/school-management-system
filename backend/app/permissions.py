"""
Role-based permission system for School Management System
"""

from enum import Enum
from typing import List, Dict, Set
from dataclasses import dataclass

class Module(Enum):
    """Module enumeration"""
    CLASSROOMS = "classrooms"
    STUDENTS = "students"
    TEACHERS = "teachers"
    ATTENDANCE = "attendance"
    EXAMS = "exams"
    EXAM_RESULTS = "exam_results"
    TIMETABLE = "timetable"
    ANNOUNCEMENTS = "announcements"
    DIRECT_MESSAGES = "direct_messages"
    FEE_INVOICES = "fee_invoices"
    FEE_PAYMENTS = "fee_payments"
    HR_EMPLOYEES = "hr_employees"
    PAYROLL = "payroll"
    LEAVES = "leaves"
    LIBRARY_BOOKS = "library_books"
    LIBRARY_ISSUES = "library_issues"

class Permission(Enum):
    """Permission enumeration"""
    READ = "read"
    WRITE = "write"

@dataclass
class RolePermission:
    """Role permission configuration"""
    role: str
    read_modules: List[Module]
    write_modules: List[Module]

# Role-based permission matrix
ROLE_PERMISSIONS: Dict[str, RolePermission] = {
    "superadmin": RolePermission(
        role="superadmin",
        read_modules=list(Module),
        write_modules=list(Module)
    ),
    "school": RolePermission(
        role="school",
        read_modules=list(Module),
        write_modules=list(Module)
    ),
    "admin": RolePermission(
        role="admin",
        read_modules=list(Module),
        write_modules=list(Module)
    ),
    "teacher": RolePermission(
        role="teacher",
        read_modules=[
            Module.CLASSROOMS,
            Module.STUDENTS,
            Module.TEACHERS,
            Module.ATTENDANCE,
            Module.EXAMS,
            Module.EXAM_RESULTS,
            Module.TIMETABLE,
            Module.ANNOUNCEMENTS,
            Module.DIRECT_MESSAGES
        ],
        write_modules=[
            Module.ATTENDANCE,
            Module.EXAMS,
            Module.EXAM_RESULTS,
            Module.TIMETABLE,
            Module.ANNOUNCEMENTS,
            Module.DIRECT_MESSAGES
        ]
    ),
    "student": RolePermission(
        role="student",
        read_modules=[
            Module.ATTENDANCE,
            Module.FEE_INVOICES,
            Module.FEE_PAYMENTS,
            Module.EXAMS,
            Module.EXAM_RESULTS,
            Module.TIMETABLE,
            Module.ANNOUNCEMENTS,
            Module.DIRECT_MESSAGES,
            Module.CLASSROOMS
        ],
        write_modules=[
            Module.DIRECT_MESSAGES
        ]
    ),
    "parent": RolePermission(
        role="parent",
        read_modules=[
            Module.ATTENDANCE,
            Module.FEE_INVOICES,
            Module.FEE_PAYMENTS,
            Module.EXAMS,
            Module.EXAM_RESULTS,
            Module.TIMETABLE,
            Module.ANNOUNCEMENTS,
            Module.DIRECT_MESSAGES,
            Module.CLASSROOMS
        ],
        write_modules=[
            Module.DIRECT_MESSAGES
        ]
    ),
    "accountant": RolePermission(
        role="accountant",
        read_modules=[
            Module.FEE_INVOICES,
            Module.FEE_PAYMENTS,
            Module.HR_EMPLOYEES,
            Module.PAYROLL,
            Module.LEAVES,
            Module.ANNOUNCEMENTS,
            Module.DIRECT_MESSAGES
        ],
        write_modules=[
            Module.FEE_INVOICES,
            Module.FEE_PAYMENTS,
            Module.PAYROLL,
            Module.DIRECT_MESSAGES
        ]
    ),
    "librarian": RolePermission(
        role="librarian",
        read_modules=[
            Module.LIBRARY_BOOKS,
            Module.LIBRARY_ISSUES,
            Module.ANNOUNCEMENTS,
            Module.DIRECT_MESSAGES
        ],
        write_modules=[
            Module.LIBRARY_BOOKS,
            Module.LIBRARY_ISSUES,
            Module.DIRECT_MESSAGES
        ]
    )
}

def get_role_permissions(role: str) -> RolePermission:
    """Get permissions for a specific role"""
    return ROLE_PERMISSIONS.get(role, RolePermission(role, [], []))

def has_permission(role: str, module: Module, permission: Permission) -> bool:
    """Check if a role has permission for a specific module"""
    role_perm = get_role_permissions(role)
    
    if permission == Permission.READ:
        return module in role_perm.read_modules
    elif permission == Permission.WRITE:
        return module in role_perm.write_modules
    
    return False

def get_accessible_modules(role: str, permission: Permission) -> List[Module]:
    """Get all modules accessible to a role for a specific permission"""
    role_perm = get_role_permissions(role)
    
    if permission == Permission.READ:
        return role_perm.read_modules
    elif permission == Permission.WRITE:
        return role_perm.write_modules
    
    return []

def can_access_module(role: str, module: Module, action: str) -> bool:
    """Check if role can access module for specific action"""
    if action.lower() in ['get', 'list', 'view', 'read']:
        return has_permission(role, module, Permission.READ)
    elif action.lower() in ['post', 'put', 'delete', 'create', 'update', 'write']:
        return has_permission(role, module, Permission.WRITE)
    
    return False
