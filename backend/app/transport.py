from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, TransportRoute, Vehicle, TransportAssignment
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/transport/routes', response_model=TransportRoute)
def create_route(school_id: int, payload: TransportRoute, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/transport/routes', response_model=list[TransportRoute])
def list_routes(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return session.exec(select(TransportRoute).where(TransportRoute.school_id == school_id)).all()


@router.get('/transport/routes/{route_id}', response_model=TransportRoute)
def get_route(route_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(TransportRoute, route_id)
    if not item:
        raise HTTPException(status_code=404, detail='Route not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return item


@router.put('/transport/routes/{route_id}', response_model=TransportRoute)
def update_route(route_id: int, payload: TransportRoute, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(TransportRoute, route_id)
    if not item:
        raise HTTPException(status_code=404, detail='Route not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/transport/routes/{route_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_route(route_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(TransportRoute, route_id)
    if not item:
        raise HTTPException(status_code=404, detail='Route not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/transport/vehicles', response_model=Vehicle)
def create_vehicle(school_id: int, payload: Vehicle, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/transport/vehicles', response_model=list[Vehicle])
def list_vehicles(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return session.exec(select(Vehicle).where(Vehicle.school_id == school_id)).all()


@router.get('/transport/vehicles/{vehicle_id}', response_model=Vehicle)
def get_vehicle(vehicle_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(Vehicle, vehicle_id)
    if not item:
        raise HTTPException(status_code=404, detail='Vehicle not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return item


@router.put('/transport/vehicles/{vehicle_id}', response_model=Vehicle)
def update_vehicle(vehicle_id: int, payload: Vehicle, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(Vehicle, vehicle_id)
    if not item:
        raise HTTPException(status_code=404, detail='Vehicle not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/transport/vehicles/{vehicle_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(Vehicle, vehicle_id)
    if not item:
        raise HTTPException(status_code=404, detail='Vehicle not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/transport/assignments', response_model=TransportAssignment)
def create_assignment(school_id: int, payload: TransportAssignment, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/transport/assignments', response_model=list[TransportAssignment])
def list_assignments(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return session.exec(select(TransportAssignment).where(TransportAssignment.school_id == school_id)).all()


@router.get('/transport/assignments/{assignment_id}', response_model=TransportAssignment)
def get_assignment(assignment_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(TransportAssignment, assignment_id)
    if not item:
        raise HTTPException(status_code=404, detail='Assignment not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return item


@router.delete('/transport/assignments/{assignment_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(TransportAssignment, assignment_id)
    if not item:
        raise HTTPException(status_code=404, detail='Assignment not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
