from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, MetricSnapshot
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/analytics/metrics', response_model=MetricSnapshot)
def create_metric(school_id: int, payload: MetricSnapshot, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/analytics/metrics', response_model=list[MetricSnapshot])
def list_metrics(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return session.exec(select(MetricSnapshot).where(MetricSnapshot.school_id == school_id)).all()


@router.get('/analytics/metrics/{metric_id}', response_model=MetricSnapshot)
def get_metric(metric_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(MetricSnapshot, metric_id)
    if not item:
        raise HTTPException(status_code=404, detail='Metric not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school)
    return item


@router.delete('/analytics/metrics/{metric_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_metric(metric_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(MetricSnapshot, metric_id)
    if not item:
        raise HTTPException(status_code=404, detail='Metric not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
