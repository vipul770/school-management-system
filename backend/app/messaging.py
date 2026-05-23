from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, Announcement, DirectMessage
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/messaging/announcements', response_model=Announcement)
def create_announcement(school_id: int, payload: Announcement, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/messaging/announcements', response_model=list[Announcement])
def list_announcements(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return session.exec(select(Announcement).where(Announcement.school_id == school_id)).all()


@router.get('/messaging/announcements/{announcement_id}', response_model=Announcement)
def get_announcement(announcement_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(Announcement, announcement_id)
    if not item:
        raise HTTPException(status_code=404, detail='Announcement not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return item


@router.delete('/messaging/announcements/{announcement_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(announcement_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(Announcement, announcement_id)
    if not item:
        raise HTTPException(status_code=404, detail='Announcement not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/messaging/messages', response_model=DirectMessage)
def create_message(school_id: int, payload: DirectMessage, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    if payload.sender_id is None:
        payload.sender_id = current.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/messaging/messages', response_model=list[DirectMessage])
def list_messages(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    if current.role in (Role.superadmin, Role.admin, Role.school):
        return session.exec(select(DirectMessage).where(DirectMessage.school_id == school_id)).all()
    return session.exec(
        select(DirectMessage).where(
            DirectMessage.school_id == school_id,
            (DirectMessage.sender_id == current.id) | (DirectMessage.recipient_id == current.id)
        )
    ).all()


@router.get('/messaging/messages/{message_id}', response_model=DirectMessage)
def get_message(message_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(DirectMessage, message_id)
    if not item:
        raise HTTPException(status_code=404, detail='Message not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    if current.role not in (Role.superadmin, Role.admin, Role.school):
        if item.sender_id != current.id and item.recipient_id != current.id:
            raise HTTPException(status_code=403, detail='Not allowed to access this message')
    return item


@router.delete('/messaging/messages/{message_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(DirectMessage, message_id)
    if not item:
        raise HTTPException(status_code=404, detail='Message not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    if current.role not in (Role.superadmin, Role.admin, Role.school):
        if item.sender_id != current.id:
            raise HTTPException(status_code=403, detail='Only sender can delete this message')
    session.delete(item)
    session.commit()
    return {}
