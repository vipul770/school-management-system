from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_session
from .auth import requires_role, get_current_user
from .models import Role, InventoryItem, InventoryTransaction
from .router_utils import apply_school_scope

router = APIRouter()


@router.post('/schools/{school_id}/inventory/items', response_model=InventoryItem)
def create_item(school_id: int, payload: InventoryItem, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/inventory/items', response_model=list[InventoryItem])
def list_items(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(InventoryItem).where(InventoryItem.school_id == school_id)).all()


@router.get('/inventory/items/{item_id}', response_model=InventoryItem)
def get_item(item_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    return item


@router.put('/inventory/items/{item_id}', response_model=InventoryItem)
def update_item(item_id: int, payload: InventoryItem, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    payload.id = item.id
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.delete('/inventory/items/{item_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    session.delete(item)
    session.commit()
    return {}


@router.post('/schools/{school_id}/inventory/transactions', response_model=InventoryTransaction)
def create_transaction(school_id: int, payload: InventoryTransaction, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    payload = apply_school_scope(payload, school_id, session)
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@router.get('/schools/{school_id}/inventory/transactions', response_model=list[InventoryTransaction])
def list_transactions(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(InventoryTransaction).where(InventoryTransaction.school_id == school_id)).all()


@router.get('/inventory/transactions/{transaction_id}', response_model=InventoryTransaction)
def get_transaction(transaction_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(InventoryTransaction, transaction_id)
    if not item:
        raise HTTPException(status_code=404, detail='Transaction not found')
    return item


@router.delete('/inventory/transactions/{transaction_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    item = session.get(InventoryTransaction, transaction_id)
    if not item:
        raise HTTPException(status_code=404, detail='Transaction not found')
    session.delete(item)
    session.commit()
    return {}
