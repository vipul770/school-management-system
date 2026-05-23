from fastapi import HTTPException
from sqlmodel import Session, select
from .models import School, Role, User


def apply_school_scope(payload, school_id: int, session: Session):
    payload.school_id = school_id
    if getattr(payload, 'tenant_id', None) is None:
        school = session.exec(select(School).where(School.id == school_id)).first()
        if school:
            payload.tenant_id = school.tenant_id
    return payload


def ensure_school_access(current: User, school_id: int, session: Session):
    if current.role == Role.superadmin:
        return

    school = session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=404, detail='School not found')

    if current.school_id and current.school_id == school_id:
        return

    if current.tenant_id and school.tenant_id == current.tenant_id:
        return

    raise HTTPException(status_code=403, detail='Not allowed to access this school')


def ensure_role_allowed(current: User, *roles: Role):
    if not roles:
        return
    if current.role not in roles:
        raise HTTPException(status_code=403, detail='Operation forbidden for your role')
