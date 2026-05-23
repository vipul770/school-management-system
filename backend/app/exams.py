from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, Exam, ExamResult
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/exams', response_model=Exam)
def create_exam(school_id: int, payload: Exam, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/exams', response_model=list[Exam])
def list_exams(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return session.exec(select(Exam).where(Exam.school_id == school_id)).all()


@router.get('/exams/{exam_id}', response_model=Exam)
def get_exam(exam_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(Exam, exam_id)
    if not item:
        raise HTTPException(status_code=404, detail='Exam not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return item


@router.put('/exams/{exam_id}', response_model=Exam)
def update_exam(exam_id: int, payload: Exam, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(Exam, exam_id)
    if not item:
        raise HTTPException(status_code=404, detail='Exam not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/exams/{exam_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(exam_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(Exam, exam_id)
    if not item:
        raise HTTPException(status_code=404, detail='Exam not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/exams/results', response_model=ExamResult)
def create_result(school_id: int, payload: ExamResult, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/exams/results', response_model=list[ExamResult])
def list_results(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return session.exec(select(ExamResult).where(ExamResult.school_id == school_id)).all()


@router.get('/exams/results/{result_id}', response_model=ExamResult)
def get_result(result_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(ExamResult, result_id)
    if not item:
        raise HTTPException(status_code=404, detail='Exam result not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)
    return item


@router.put('/exams/results/{result_id}', response_model=ExamResult)
def update_result(result_id: int, payload: ExamResult, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(ExamResult, result_id)
    if not item:
        raise HTTPException(status_code=404, detail='Exam result not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/exams/results/{result_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_result(result_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    item = session.get(ExamResult, result_id)
    if not item:
        raise HTTPException(status_code=404, detail='Exam result not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
