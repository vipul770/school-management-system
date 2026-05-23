from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, AttendanceRecord
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/attendance', response_model=AttendanceRecord)
def create_record(school_id: int, payload: AttendanceRecord, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/attendance', response_model=list[AttendanceRecord])
def list_records(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return session.exec(select(AttendanceRecord).where(AttendanceRecord.school_id == school_id)).all()


@router.get('/attendance/{record_id}', response_model=AttendanceRecord)
def get_record(record_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(AttendanceRecord, record_id)
    if not item:
        raise HTTPException(status_code=404, detail='Attendance record not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return item


@router.put('/attendance/{record_id}', response_model=AttendanceRecord)
def update_record(record_id: int, payload: AttendanceRecord, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(AttendanceRecord, record_id)
    if not item:
        raise HTTPException(status_code=404, detail='Attendance record not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/attendance/{record_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(AttendanceRecord, record_id)
    if not item:
        raise HTTPException(status_code=404, detail='Attendance record not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
