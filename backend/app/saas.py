from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import List
from .db import get_db_session
from .saas_models import (
    Plan, Subscription, Invoice, PaymentMethod, UsageMetric, TenantSettings,
    PlanCreate, PlanRead, SubscriptionCreate, SubscriptionRead, InvoiceRead,
    PlanType, SubscriptionStatus, BillingCycle
)
from .auth import get_current_user
from .models import User, Tenant

router = APIRouter()


# Plans Management
@router.get("/plans", response_model=List[PlanRead])
def get_plans(db: Session = Depends(get_db_session)):
    """Get all available plans"""
    plans = db.exec(select(Plan).where(Plan.is_active == True)).all()
    return plans


@router.post("/plans", response_model=PlanRead)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db_session), current_user: User = Depends(get_current_user)):
    """Create a new plan (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_plan = Plan.model_validate(plan)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


# Subscription Management
@router.get("/subscription", response_model=SubscriptionRead)
def get_current_subscription(
    db: Session = Depends(get_db_session), 
    current_user: User = Depends(get_current_user)
):
    """Get current tenant's subscription"""
    subscription = db.exec(
        select(Subscription).where(Subscription.tenant_id == current_user.tenant_id)
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No subscription found")
    
    # Get plan details
    plan = db.get(Plan, subscription.plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return SubscriptionRead(
        id=subscription.id,
        tenant_id=subscription.tenant_id,
        plan=PlanRead.model_validate(plan),
        status=subscription.status,
        billing_cycle=subscription.billing_cycle,
        trial_ends_at=subscription.trial_ends_at,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
        auto_renew=subscription.auto_renew,
        created_at=subscription.created_at
    )


@router.post("/subscription", response_model=SubscriptionRead)
def create_subscription(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Create or upgrade subscription"""
    # Check if tenant already has subscription
    existing = db.exec(
        select(Subscription).where(Subscription.tenant_id == current_user.tenant_id)
    ).first()
    
    if existing and existing.status == SubscriptionStatus.active:
        raise HTTPException(status_code=400, detail="Active subscription already exists")
    
    # Get plan details
    plan = db.get(Plan, subscription.plan_id)
    if not plan or not plan.is_active:
        raise HTTPException(status_code=404, detail="Plan not found or inactive")
    
    # Create subscription
    now = datetime.utcnow()
    trial_end = now + timedelta(days=14)  # 14-day trial
    
    db_subscription = Subscription(
        tenant_id=current_user.tenant_id,
        plan_id=subscription.plan_id,
        billing_cycle=subscription.billing_cycle,
        status=SubscriptionStatus.trial,
        trial_ends_at=trial_end.isoformat(),
        current_period_start=now.isoformat(),
        current_period_end=trial_end.isoformat()
    )
    
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    # Get plan for response
    plan = db.get(Plan, db_subscription.plan_id)
    
    return SubscriptionRead(
        id=db_subscription.id,
        tenant_id=db_subscription.tenant_id,
        plan=PlanRead.model_validate(plan),
        status=db_subscription.status,
        billing_cycle=db_subscription.billing_cycle,
        trial_ends_at=db_subscription.trial_ends_at,
        current_period_start=db_subscription.current_period_start,
        current_period_end=db_subscription.current_period_end,
        auto_renew=db_subscription.auto_renew,
        created_at=db_subscription.created_at
    )


@router.post("/subscription/cancel")
def cancel_subscription(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Cancel subscription at end of period"""
    subscription = db.exec(
        select(Subscription).where(Subscription.tenant_id == current_user.tenant_id)
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No subscription found")
    
    subscription.auto_renew = False
    subscription.cancelled_at = datetime.utcnow().isoformat()
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}


# Billing Management
@router.get("/invoices", response_model=List[InvoiceRead])
def get_invoices(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get tenant's invoices"""
    invoices = db.exec(
        select(Invoice).where(Invoice.tenant_id == current_user.tenant_id)
        .order_by(Invoice.created_at.desc())
    ).all()
    return invoices


@router.post("/usage/track")
def track_usage(
    metric_name: str,
    metric_value: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Track usage metrics for billing/limits"""
    # Get current period
    now = datetime.utcnow()
    period_start = now.replace(day=1).isoformat()
    period_end = (now.replace(day=1) + timedelta(days=32)).replace(day=1).isoformat()
    
    # Check if metric already exists for this period
    existing = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == current_user.tenant_id,
            UsageMetric.metric_name == metric_name,
            UsageMetric.period_start == period_start
        )
    ).first()
    
    if existing:
        existing.metric_value += metric_value
    else:
        usage = UsageMetric(
            tenant_id=current_user.tenant_id,
            metric_name=metric_name,
            metric_value=metric_value,
            period_start=period_start,
            period_end=period_end
        )
        db.add(usage)
    
    db.commit()
    return {"message": "Usage tracked successfully"}


@router.get("/usage/current")
def get_current_usage(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get current usage metrics"""
    now = datetime.utcnow()
    period_start = now.replace(day=1).isoformat()
    
    metrics = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == current_user.tenant_id,
            UsageMetric.period_start == period_start
        )
    ).all()
    
    return {"metrics": metrics, "period": period_start}


# Tenant Settings
@router.get("/settings")
def get_tenant_settings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get tenant-specific settings"""
    settings = db.exec(
        select(TenantSettings).where(TenantSettings.tenant_id == current_user.tenant_id)
    ).all()
    
    return {setting.key: setting.value for setting in settings}


@router.post("/settings")
def update_tenant_settings(
    settings: dict,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Update tenant-specific settings"""
    for key, value in settings.items():
        existing = db.exec(
            select(TenantSettings).where(
                TenantSettings.tenant_id == current_user.tenant_id,
                TenantSettings.key == key
            )
        ).first()
        
        if existing:
            existing.value = value
            existing.updated_at = datetime.utcnow().isoformat()
        else:
            setting = TenantSettings(
                tenant_id=current_user.tenant_id,
                key=key,
                value=value
            )
            db.add(setting)
    
    db.commit()
    return {"message": "Settings updated successfully"}


# Admin endpoints for superadmin
@router.get("/admin/tenants")
def get_all_tenants(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get all tenants (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    tenants = db.exec(select(Tenant)).all()
    
    # Add subscription info
    result = []
    for tenant in tenants:
        subscription = db.exec(
            select(Subscription).where(Subscription.tenant_id == tenant.id)
        ).first()
        
        tenant_data = {
            "id": tenant.id,
            "name": tenant.name,
            "code": tenant.code,
            "contact_email": tenant.contact_email,
            "subscription_status": subscription.status if subscription else "none",
            "created_at": tenant.created_at if hasattr(tenant, 'created_at') else None
        }
        result.append(tenant_data)
    
    return result


@router.get("/admin/analytics")
def get_saas_analytics(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get SaaS analytics (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get counts
    total_tenants = db.exec(select(Tenant)).count()
    active_subscriptions = db.exec(
        select(Subscription).where(Subscription.status == SubscriptionStatus.active)
    ).count()
    trial_subscriptions = db.exec(
        select(Subscription).where(Subscription.status == SubscriptionStatus.trial)
    ).count()
    
    # Get MRR (Monthly Recurring Revenue)
    active_subs = db.exec(
        select(Subscription, Plan).join(Plan)
        .where(Subscription.status == SubscriptionStatus.active)
    ).all()
    
    mrr = 0
    for subscription, plan in active_subs:
        if subscription.billing_cycle == BillingCycle.monthly:
            mrr += plan.price_monthly or 0
        else:
            mrr += (plan.price_yearly or 0) / 12
    
    return {
        "total_tenants": total_tenants,
        "active_subscriptions": active_subscriptions,
        "trial_subscriptions": trial_subscriptions,
        "monthly_recurring_revenue": mrr,
        "conversion_rate": (active_subscriptions / total_tenants * 100) if total_tenants > 0 else 0
    }
