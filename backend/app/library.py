from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, LibraryBook, LibraryIssue
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/library/books', response_model=LibraryBook)
def create_book(school_id: int, payload: LibraryBook, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.librarian)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/library/books', response_model=list[LibraryBook])
def list_books(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.librarian)
    return session.exec(select(LibraryBook).where(LibraryBook.school_id == school_id)).all()


@router.get('/library/books/{book_id}', response_model=LibraryBook)
def get_book(book_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(LibraryBook, book_id)
    if not item:
        raise HTTPException(status_code=404, detail='Book not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.librarian)
    return item


@router.put('/library/books/{book_id}', response_model=LibraryBook)
def update_book(book_id: int, payload: LibraryBook, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.librarian)), session: Session = Depends(get_session)):
    item = session.get(LibraryBook, book_id)
    if not item:
        raise HTTPException(status_code=404, detail='Book not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/library/books/{book_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.librarian)), session: Session = Depends(get_session)):
    item = session.get(LibraryBook, book_id)
    if not item:
        raise HTTPException(status_code=404, detail='Book not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/library/issues', response_model=LibraryIssue)
def create_issue(school_id: int, payload: LibraryIssue, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.librarian)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/library/issues', response_model=list[LibraryIssue])
def list_issues(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.librarian)
    return session.exec(select(LibraryIssue).where(LibraryIssue.school_id == school_id)).all()


@router.get('/library/issues/{issue_id}', response_model=LibraryIssue)
def get_issue(issue_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(LibraryIssue, issue_id)
    if not item:
        raise HTTPException(status_code=404, detail='Issue not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.librarian)
    return item


@router.delete('/library/issues/{issue_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(issue_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.librarian)), session: Session = Depends(get_session)):
    item = session.get(LibraryIssue, issue_id)
    if not item:
        raise HTTPException(status_code=404, detail='Issue not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
