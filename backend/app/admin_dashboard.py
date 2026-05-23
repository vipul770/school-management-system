from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .db import get_db_session
from .models import User, Tenant, School, Student, Role
from .saas_models import (
    Subscription, Plan, Invoice, UsageMetric, TenantSettings,
    SubscriptionStatus, PlanType
)
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()


# Admin Dashboard Schemas
class TenantDashboard(BaseModel):
    tenant_info: Dict[str, Any]
    subscription_info: Dict[str, Any]
    usage_metrics: Dict[str, Any]
    quick_stats: Dict[str, Any]
    recent_activities: List[Dict[str, Any]]


class TenantManagement(BaseModel):
    id: int
    name: str
    code: str
    contact_email: str
    status: str
    subscription_status: str
    plan_name: str
    user_count: int
    school_count: int
    student_count: int
    created_at: str
    trial_end_date: str = None
    mrr: float = 0.0


class SystemAnalytics(BaseModel):
    total_tenants: int
    active_subscriptions: int
    trial_subscriptions: int
    total_users: int
    total_students: int
    monthly_recurring_revenue: float
    churn_rate: float
    conversion_rate: float
    growth_metrics: Dict[str, Any]


class TenantDetails(BaseModel):
    tenant: Dict[str, Any]
    subscription: Dict[str, Any]
    users: List[Dict[str, Any]]
    schools: List[Dict[str, Any]]
    usage_metrics: List[Dict[str, Any]]
    invoices: List[Dict[str, Any]]
    settings: Dict[str, Any]


# Tenant Dashboard
@router.get("/dashboard", response_model=TenantDashboard)
def get_tenant_dashboard(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard for current tenant admin"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    tenant = db.get(Tenant, current_user.tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get subscription info
    subscription = db.exec(
        select(Subscription, Plan).join(Plan)
        .where(Subscription.tenant_id == current_user.tenant_id)
    ).first()
    
    sub_info = {}
    if subscription:
        sub, plan = subscription
        sub_info = {
            "status": sub.status,
            "plan_name": plan.name,
            "plan_type": plan.type,
            "trial_end": sub.trial_ends_at,
            "period_end": sub.current_period_end,
            "auto_renew": sub.auto_renew,
            "max_users": plan.max_users,
            "max_schools": plan.max_schools
        }
    
    # Get usage metrics
    current_month = datetime.utcnow().replace(day=1).isoformat()
    usage_metrics = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == current_user.tenant_id,
            UsageMetric.period_start == current_month
        )
    ).all()
    
    usage_data = {metric.metric_name: metric.metric_value for metric in usage_metrics}
    
    # Get quick stats
    user_count = db.exec(
        select(func.count(User.id)).where(User.tenant_id == current_user.tenant_id)
    ).first()
    
    school_count = db.exec(
        select(func.count(School.id)).where(School.tenant_id == current_user.tenant_id)
    ).first()
    
    student_count = db.exec(
        select(func.count(Student.id)).where(Student.tenant_id == current_user.tenant_id)
    ).first()
    
    quick_stats = {
        "total_users": user_count,
        "total_schools": school_count,
        "total_students": student_count,
        "storage_used": usage_data.get("storage_mb", 0),
        "api_calls": usage_data.get("api_calls", 0)
    }
    
    # Get recent activities (simplified)
    recent_activities = [
        {"type": "user_login", "description": "User logged in", "time": "2 hours ago"},
        {"type": "data_export", "description": "Student data exported", "time": "1 day ago"},
        {"type": "payment", "description": "Payment received", "time": "3 days ago"}
    ]
    
    return TenantDashboard(
        tenant_info={
            "id": tenant.id,
            "name": tenant.name,
            "code": tenant.code,
            "contact_email": tenant.contact_email
        },
        subscription_info=sub_info,
        usage_metrics=usage_data,
        quick_stats=quick_stats,
        recent_activities=recent_activities
    )


# Super Admin Endpoints
@router.get("/admin/tenants", response_model=List[TenantManagement])
def get_all_tenants_admin(
    skip: int = 0,
    limit: int = 50,
    status_filter: str = None,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get all tenants for admin management"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    query = select(Tenant)
    
    if status_filter:
        query = query.where(Tenant.status == status_filter)
    
    tenants = db.exec(query.offset(skip).limit(limit)).all()
    
    result = []
    for tenant in tenants:
        # Get subscription info
        subscription = db.exec(
            select(Subscription, Plan).join(Plan)
            .where(Subscription.tenant_id == tenant.id)
        ).first()
        
        sub_status = "none"
        plan_name = "No Plan"
        trial_end = None
        mrr = 0.0
        
        if subscription:
            sub, plan = subscription
            sub_status = sub.status
            plan_name = plan.name
            trial_end = sub.trial_ends_at
            
            if sub.status == SubscriptionStatus.active:
                if sub.billing_cycle == "monthly":
                    mrr = plan.price_monthly or 0
                else:
                    mrr = (plan.price_yearly or 0) / 12
        
        # Get counts
        user_count = db.exec(
            select(func.count(User.id)).where(User.tenant_id == tenant.id)
        ).first()
        
        school_count = db.exec(
            select(func.count(School.id)).where(School.tenant_id == tenant.id)
        ).first()
        
        student_count = db.exec(
            select(func.count(Student.id)).where(Student.tenant_id == tenant.id)
        ).first()
        
        result.append(TenantManagement(
            id=tenant.id,
            name=tenant.name,
            code=tenant.code,
            contact_email=tenant.contact_email,
            status=getattr(tenant, 'status', 'active'),
            subscription_status=sub_status,
            plan_name=plan_name,
            user_count=user_count,
            school_count=school_count,
            student_count=student_count,
            created_at=getattr(tenant, 'created_at', datetime.utcnow().isoformat()),
            trial_end_date=trial_end,
            mrr=mrr
        ))
    
    return result


@router.get("/admin/analytics", response_model=SystemAnalytics)
def get_system_analytics(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get system-wide analytics"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    # Basic counts
    total_tenants = db.exec(select(func.count(Tenant.id))).first()
    total_users = db.exec(select(func.count(User.id))).first()
    total_students = db.exec(select(func.count(Student.id))).first()
    
    # Subscription stats
    active_subscriptions = db.exec(
        select(func.count(Subscription.id))
        .where(Subscription.status == SubscriptionStatus.active)
    ).first()
    
    trial_subscriptions = db.exec(
        select(func.count(Subscription.id))
        .where(Subscription.status == SubscriptionStatus.trial)
    ).first()
    
    # MRR calculation
    active_subs = db.exec(
        select(Subscription, Plan).join(Plan)
        .where(Subscription.status == SubscriptionStatus.active)
    ).all()
    
    mrr = 0.0
    for subscription, plan in active_subs:
        if subscription.billing_cycle == "monthly":
            mrr += plan.price_monthly or 0
        else:
            mrr += (plan.price_yearly or 0) / 12
    
    # Growth metrics (simplified)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_tenants = db.exec(
        select(func.count(Tenant.id))
        .where(Tenant.created_at >= thirty_days_ago.isoformat())
    ).first()
    
    conversion_rate = (active_subscriptions / total_tenants * 100) if total_tenants > 0 else 0
    
    return SystemAnalytics(
        total_tenants=total_tenants,
        active_subscriptions=active_subscriptions,
        trial_subscriptions=trial_subscriptions,
        total_users=total_users,
        total_students=total_students,
        monthly_recurring_revenue=mrr,
        churn_rate=0.0,  # Would need historical data
        conversion_rate=conversion_rate,
        growth_metrics={
            "new_tenants_30_days": new_tenants,
            "tenant_growth_rate": (new_tenants / total_tenants * 100) if total_tenants > 0 else 0
        }
    )


@router.get("/admin/tenant/{tenant_id}", response_model=TenantDetails)
def get_tenant_details_admin(
    tenant_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific tenant"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get subscription
    subscription = db.exec(
        select(Subscription, Plan).join(Plan)
        .where(Subscription.tenant_id == tenant_id)
    ).first()
    
    sub_data = {}
    if subscription:
        sub, plan = subscription
        sub_data = {
            "id": sub.id,
            "status": sub.status,
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "type": plan.type,
                "price_monthly": plan.price_monthly,
                "price_yearly": plan.price_yearly
            },
            "billing_cycle": sub.billing_cycle,
            "trial_ends_at": sub.trial_ends_at,
            "auto_renew": sub.auto_renew
        }
    
    # Get users
    users = db.exec(
        select(User).where(User.tenant_id == tenant_id)
        .limit(20)
    ).all()
    
    user_data = [
        {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "created_at": getattr(user, 'created_at', None)
        }
        for user in users
    ]
    
    # Get schools
    schools = db.exec(
        select(School).where(School.tenant_id == tenant_id)
        .limit(20)
    ).all()
    
    school_data = [
        {
            "id": school.id,
            "name": school.name,
            "address": school.address
        }
        for school in schools
    ]
    
    # Get usage metrics
    metrics = db.exec(
        select(UsageMetric).where(UsageMetric.tenant_id == tenant_id)
        .order_by(UsageMetric.created_at.desc())
        .limit(50)
    ).all()
    
    metrics_data = [
        {
            "metric_name": metric.metric_name,
            "metric_value": metric.metric_value,
            "period_start": metric.period_start,
            "period_end": metric.period_end
        }
        for metric in metrics
    ]
    
    # Get invoices
    invoices = db.exec(
        select(Invoice).where(Invoice.tenant_id == tenant_id)
        .order_by(Invoice.created_at.desc())
        .limit(20)
    ).all()
    
    invoice_data = [
        {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "amount": invoice.amount,
            "status": invoice.status,
            "due_date": invoice.due_date,
            "created_at": invoice.created_at
        }
        for invoice in invoices
    ]
    
    # Get settings
    settings = db.exec(
        select(TenantSettings).where(TenantSettings.tenant_id == tenant_id)
    ).all()
    
    settings_data = {setting.key: setting.value for setting in settings}
    
    return TenantDetails(
        tenant={
            "id": tenant.id,
            "name": tenant.name,
            "code": tenant.code,
            "contact_email": tenant.contact_email
        },
        subscription=sub_data,
        users=user_data,
        schools=school_data,
        usage_metrics=metrics_data,
        invoices=invoice_data,
        settings=settings_data
    )


@router.post("/admin/tenant/{tenant_id}/suspend")
def suspend_tenant(
    tenant_id: int,
    reason: str,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Suspend a tenant"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Suspend subscription
    subscription = db.exec(
        select(Subscription).where(Subscription.tenant_id == tenant_id)
    ).first()
    
    if subscription:
        subscription.status = SubscriptionStatus.suspended
        subscription.cancelled_at = datetime.utcnow().isoformat()
    
    # Add suspension reason to settings
    setting = TenantSettings(
        tenant_id=tenant_id,
        key="suspension_reason",
        value=f"{datetime.utcnow().isoformat()}: {reason}"
    )
    db.add(setting)
    
    db.commit()
    
    return {"message": "Tenant suspended successfully"}


@router.post("/admin/tenant/{tenant_id}/activate")
def activate_tenant(
    tenant_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Activate a suspended tenant"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Activate subscription
    subscription = db.exec(
        select(Subscription).where(Subscription.tenant_id == tenant_id)
    ).first()
    
    if subscription and subscription.status == SubscriptionStatus.suspended:
        subscription.status = SubscriptionStatus.active
        subscription.cancelled_at = None
    
    # Remove suspension reason
    suspension_setting = db.exec(
        select(TenantSettings).where(
            TenantSettings.tenant_id == tenant_id,
            TenantSettings.key == "suspension_reason"
        )
    ).first()
    
    if suspension_setting:
        db.delete(suspension_setting)
    
    db.commit()
    
    return {"message": "Tenant activated successfully"}
