from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, FeeInvoice, FeePayment
from .router_utils import apply_school_scope, ensure_school_access, ensure_role_allowed

router = APIRouter()


@router.post('/schools/{school_id}/fees/invoices', response_model=FeeInvoice)
def create_invoice(school_id: int, payload: FeeInvoice, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/fees/invoices', response_model=list[FeeInvoice])
def list_invoices(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant, Role.student, Role.parent)
    return session.exec(select(FeeInvoice).where(FeeInvoice.school_id == school_id)).all()


@router.get('/fees/invoices/{invoice_id}', response_model=FeeInvoice)
def get_invoice(invoice_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(FeeInvoice, invoice_id)
    if not item:
        raise HTTPException(status_code=404, detail='Invoice not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant, Role.student, Role.parent)
    return item


@router.put('/fees/invoices/{invoice_id}', response_model=FeeInvoice)
def update_invoice(invoice_id: int, payload: FeeInvoice, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    item = session.get(FeeInvoice, invoice_id)
    if not item:
        raise HTTPException(status_code=404, detail='Invoice not found')
    ensure_school_access(current, item.school_id, session)
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/fees/invoices/{invoice_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(invoice_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    item = session.get(FeeInvoice, invoice_id)
    if not item:
        raise HTTPException(status_code=404, detail='Invoice not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/fees/payments', response_model=FeePayment)
def create_payment(school_id: int, payload: FeePayment, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/fees/payments', response_model=list[FeePayment])
def list_payments(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant, Role.student, Role.parent)
    return session.exec(select(FeePayment).where(FeePayment.school_id == school_id)).all()


@router.get('/fees/payments/{payment_id}', response_model=FeePayment)
def get_payment(payment_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(FeePayment, payment_id)
    if not item:
        raise HTTPException(status_code=404, detail='Payment not found')
    ensure_school_access(current, item.school_id, session)
    ensure_role_allowed(current, Role.superadmin, Role.admin, Role.school, Role.accountant, Role.student, Role.parent)
    return item


@router.delete('/fees/payments/{payment_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.accountant)), session: Session = Depends(get_session)):
    item = session.get(FeePayment, payment_id)
    if not item:
        raise HTTPException(status_code=404, detail='Payment not found')
    ensure_school_access(current, item.school_id, session)
    session.delete(item)
    session.commit()
    return {}
