from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, HostelRoom, HostelAssignment
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/hostel/rooms', response_model=HostelRoom)
def create_room(school_id: int, payload: HostelRoom, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/hostel/rooms', response_model=list[HostelRoom])
def list_rooms(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return session.exec(select(HostelRoom).where(HostelRoom.school_id == school_id)).all()


@router.get('/hostel/rooms/{room_id}', response_model=HostelRoom)
def get_room(room_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(HostelRoom, room_id)
    if not item:
        raise HTTPException(status_code=404, detail='Room not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return item


@router.put('/hostel/rooms/{room_id}', response_model=HostelRoom)
def update_room(room_id: int, payload: HostelRoom, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(HostelRoom, room_id)
    if not item:
        raise HTTPException(status_code=404, detail='Room not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/hostel/rooms/{room_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(HostelRoom, room_id)
    if not item:
        raise HTTPException(status_code=404, detail='Room not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/hostel/assignments', response_model=HostelAssignment)
def create_assignment(school_id: int, payload: HostelAssignment, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/hostel/assignments', response_model=list[HostelAssignment])
def list_assignments(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return session.exec(select(HostelAssignment).where(HostelAssignment.school_id == school_id)).all()


@router.get('/hostel/assignments/{assignment_id}', response_model=HostelAssignment)
def get_assignment(assignment_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(HostelAssignment, assignment_id)
    if not item:
        raise HTTPException(status_code=404, detail='Assignment not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return item


@router.delete('/hostel/assignments/{assignment_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(HostelAssignment, assignment_id)
    if not item:
        raise HTTPException(status_code=404, detail='Assignment not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
