"""
Middleware for role-based access control
"""

from fastapi import HTTPException, Depends
from sqlmodel import Session
from typing import List, Optional
from functools import wraps

from .auth import get_current_user
from .models import User
from .permissions import Module, Permission, has_permission, can_access_module
from .db import get_session

def require_module_permission(module: Module, permission: Permission):
    """Decorator to require specific module permission"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user from kwargs or dependencies
            current_user = None
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication required"
                )
            
            if not has_permission(current_user.role, module, permission):
                raise HTTPException(
                    status_code=403,
                    detail=f"Insufficient permissions for {permission.value} access to {module.value}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def check_module_access(module: Module, action: str):
    """Check if user can access module for specific action"""
    def dependency(current_user: User = Depends(get_current_user)):
        if not can_access_module(current_user.role, module, action):
            raise HTTPException(
                status_code=403,
                detail=f"Access denied for {action} on {module.value}"
            )
        return current_user
    return dependency

def require_role(required_roles: List[str]):
    """Require specific roles to access endpoint"""
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    return dependency

def require_same_school_or_admin():
    """Allow access to same school or admin/superadmin"""
    def dependency(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
    ):
        # Superadmin and school roles can access all schools
        if current_user.role in ['superadmin', 'school']:
            return current_user
        
        # For other roles, check if they belong to the same school
        # This would be used when accessing specific school resources
        return current_user
    return dependency

def get_accessible_modules(current_user: User, permission: Permission) -> List[str]:
    """Get list of modules user can access with specific permission"""
    from .permissions import get_accessible_modules
    modules = get_accessible_modules(current_user.role, permission)
    return [module.value for module in modules]

def filter_by_school_access(query, current_user: User, school_id: Optional[int] = None):
    """Filter query results based on user's school access"""
    # Superadmin can access all schools
    if current_user.role == 'superadmin':
        if school_id:
            query = query.where(getattr(query.column_descriptions[0]['type'], 'school_id') == school_id)
        return query
    
    # School role can access all schools in their tenant
    elif current_user.role == 'school':
        if school_id:
            query = query.where(getattr(query.column_descriptions[0]['type'], 'school_id') == school_id)
        else:
            query = query.where(getattr(query.column_descriptions[0]['type'], 'tenant_id') == current_user.tenant_id)
        return query
    
    # Other roles can only access their own school
    else:
        query = query.where(getattr(query.column_descriptions[0]['type'], 'school_id') == current_user.school_id)
        return query

class ModuleAccessChecker:
    """Class for checking module access in endpoints"""
    
    @staticmethod
    def can_read_module(user: User, module: Module) -> bool:
        """Check if user can read module"""
        return has_permission(user.role, module, Permission.READ)
    
    @staticmethod
    def can_write_module(user: User, module: Module) -> bool:
        """Check if user can write to module"""
        return has_permission(user.role, module, Permission.WRITE)
    
    @staticmethod
    def can_access_endpoint(user: User, module: Module, method: str) -> bool:
        """Check if user can access specific endpoint"""
        return can_access_module(user.role, module, method)
    
    @staticmethod
    def get_user_modules(user: User) -> dict:
        """Get all modules user can access"""
        from .permissions import get_accessible_modules, Permission
        
        return {
            "read_modules": get_accessible_modules(user.role, Permission.READ),
            "write_modules": get_accessible_modules(user.role, Permission.WRITE)
        }

# Dependency functions for specific modules
def can_read_classrooms(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_read_module(current_user, Module.CLASSROOMS):
        raise HTTPException(status_code=403, detail="No read access to classrooms")
    return current_user

def can_write_classrooms(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_write_module(current_user, Module.CLASSROOMS):
        raise HTTPException(status_code=403, detail="No write access to classrooms")
    return current_user

def can_read_students(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_read_module(current_user, Module.STUDENTS):
        raise HTTPException(status_code=403, detail="No read access to students")
    return current_user

def can_write_students(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_write_module(current_user, Module.STUDENTS):
        raise HTTPException(status_code=403, detail="No write access to students")
    return current_user

def can_read_attendance(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_read_module(current_user, Module.ATTENDANCE):
        raise HTTPException(status_code=403, detail="No read access to attendance")
    return current_user

def can_write_attendance(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_write_module(current_user, Module.ATTENDANCE):
        raise HTTPException(status_code=403, detail="No write access to attendance")
    return current_user

def can_read_exams(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_read_module(current_user, Module.EXAMS):
        raise HTTPException(status_code=403, detail="No read access to exams")
    return current_user

def can_write_exams(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_write_module(current_user, Module.EXAMS):
        raise HTTPException(status_code=403, detail="No write access to exams")
    return current_user

def can_read_fee_invoices(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_read_module(current_user, Module.FEE_INVOICES):
        raise HTTPException(status_code=403, detail="No read access to fee invoices")
    return current_user

def can_write_fee_invoices(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_write_module(current_user, Module.FEE_INVOICES):
        raise HTTPException(status_code=403, detail="No write access to fee invoices")
    return current_user

def can_read_library_books(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_read_module(current_user, Module.LIBRARY_BOOKS):
        raise HTTPException(status_code=403, detail="No read access to library books")
    return current_user

def can_write_library_books(current_user: User = Depends(get_current_user)):
    if not ModuleAccessChecker.can_write_module(current_user, Module.LIBRARY_BOOKS):
        raise HTTPException(status_code=403, detail="No write access to library books")
    return current_user
