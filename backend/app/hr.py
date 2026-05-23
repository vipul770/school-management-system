from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, Employee, PayrollRecord, LeaveRequest
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/hr/employees', response_model=Employee)
def create_employee(school_id: int, payload: Employee, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/hr/employees', response_model=list[Employee])
def list_employees(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant)
    return session.exec(select(Employee).where(Employee.school_id == school_id)).all()


@router.get('/hr/employees/{employee_id}', response_model=Employee)
def get_employee(employee_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(Employee, employee_id)
    if not item:
        raise HTTPException(status_code=404, detail='Employee not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant)
    return item


@router.put('/hr/employees/{employee_id}', response_model=Employee)
def update_employee(employee_id: int, payload: Employee, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(Employee, employee_id)
    if not item:
        raise HTTPException(status_code=404, detail='Employee not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/hr/employees/{employee_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(Employee, employee_id)
    if not item:
        raise HTTPException(status_code=404, detail='Employee not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/hr/payroll', response_model=PayrollRecord)
def create_payroll(school_id: int, payload: PayrollRecord, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/hr/payroll', response_model=list[PayrollRecord])
def list_payroll(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant)
    return session.exec(select(PayrollRecord).where(PayrollRecord.school_id == school_id)).all()


@router.get('/hr/payroll/{payroll_id}', response_model=PayrollRecord)
def get_payroll(payroll_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(PayrollRecord, payroll_id)
    if not item:
        raise HTTPException(status_code=404, detail='Payroll record not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant)
    return item


@router.delete('/hr/payroll/{payroll_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_payroll(payroll_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    item = session.get(PayrollRecord, payroll_id)
    if not item:
        raise HTTPException(status_code=404, detail='Payroll record not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/hr/leaves', response_model=LeaveRequest)
def create_leave(school_id: int, payload: LeaveRequest, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/hr/leaves', response_model=list[LeaveRequest])
def list_leaves(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant)
    return session.exec(select(LeaveRequest).where(LeaveRequest.school_id == school_id)).all()


@router.get('/hr/leaves/{leave_id}', response_model=LeaveRequest)
def get_leave(leave_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(LeaveRequest, leave_id)
    if not item:
        raise HTTPException(status_code=404, detail='Leave request not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant)
    return item


@router.put('/hr/leaves/{leave_id}', response_model=LeaveRequest)
def update_leave(leave_id: int, payload: LeaveRequest, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(LeaveRequest, leave_id)
    if not item:
        raise HTTPException(status_code=404, detail='Leave request not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/hr/leaves/{leave_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_leave(leave_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(LeaveRequest, leave_id)
    if not item:
        raise HTTPException(status_code=404, detail='Leave request not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
