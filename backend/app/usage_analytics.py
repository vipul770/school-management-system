from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .db import get_db_session
from .models import User, Tenant, School, Student
from .saas_models import (
    Subscription, Plan, Invoice, UsageMetric, TenantSettings,
    SubscriptionStatus, PlanType
)
from .auth import get_current_user
from .tenant_context import get_tenant_context
from pydantic import BaseModel

router = APIRouter()


# Analytics Schemas
class UsageMetricData(BaseModel):
    metric_name: str
    metric_value: int
    period_start: str
    period_end: str
    trend: str = "stable"  # increasing, decreasing, stable


class TenantAnalytics(BaseModel):
    tenant_id: int
    period: str
    metrics: List[UsageMetricData]
    growth_metrics: Dict[str, float]
    engagement_metrics: Dict[str, Any]
    performance_metrics: Dict[str, Any]


class SystemUsageReport(BaseModel):
    period: str
    total_tenants: int
    active_users: int
    total_api_calls: int
    storage_usage: Dict[str, int]
    top_features: List[Dict[str, Any]]
    growth_trends: Dict[str, float]


class FeatureUsage(BaseModel):
    feature_name: str
    usage_count: int
    unique_users: int
    avg_daily_usage: float


# Usage Tracking Middleware (would be added to main app)
async def track_api_usage(request, call_next, tenant_id: int):
    """Middleware to track API usage per tenant"""
    start_time = datetime.utcnow()
    response = await call_next(request)
    end_time = datetime.utcnow()
    
    # Track API call
    # This would be implemented in middleware
    # For now, we'll provide endpoints to track manually
    
    return response


# Tenant Usage Analytics
@router.get("/usage/summary")
def get_usage_summary(
    period: str = "current_month",
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get usage summary for current tenant"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    # Determine period
    now = datetime.utcnow()
    if period == "current_month":
        period_start = now.replace(day=1).isoformat()
        period_end = (now.replace(day=1) + timedelta(days=32)).replace(day=1).isoformat()
    elif period == "last_month":
        last_month = now.replace(day=1) - timedelta(days=1)
        period_start = last_month.replace(day=1).isoformat()
        period_end = last_month.replace(day=1) + timedelta(days=32)
        period_end = period_end.replace(day=1).isoformat()
    else:
        period_start = (now - timedelta(days=30)).isoformat()
        period_end = now.isoformat()
    
    # Get usage metrics
    metrics = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == current_user.tenant_id,
            UsageMetric.period_start >= period_start,
            UsageMetric.period_end <= period_end
        )
    ).all()
    
    usage_data = {}
    for metric in metrics:
        usage_data[metric.metric_name] = metric.metric_value
    
    # Get user activity
    active_users = db.exec(
        select(func.count(func.distinct(User.id)))
        .where(
            User.tenant_id == current_user.tenant_id,
            User.last_login >= period_start  # Assuming last_login field exists
        )
    ).first()
    
    # Get feature usage (simplified)
    feature_usage = [
        {"feature": "student_management", "usage": usage_data.get("student_operations", 0)},
        {"feature": "attendance", "usage": usage_data.get("attendance_records", 0)},
        {"feature": "fees", "usage": usage_data.get("fee_transactions", 0)},
        {"feature": "exams", "usage": usage_data.get("exam_records", 0)},
        {"feature": "reports", "usage": usage_data.get("report_generations", 0)}
    ]
    
    return {
        "period": period,
        "metrics": usage_data,
        "active_users": active_users or 0,
        "feature_usage": feature_usage,
        "storage_used_mb": usage_data.get("storage_mb", 0),
        "api_calls": usage_data.get("api_calls", 0)
    }


@router.get("/usage/trends")
def get_usage_trends(
    metric_name: str,
    months: int = 6,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get usage trends for a specific metric"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    # Get historical data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 * months)
    
    metrics = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == current_user.tenant_id,
            UsageMetric.metric_name == metric_name,
            UsageMetric.period_start >= start_date.isoformat()
        ).order_by(UsageMetric.period_start)
    ).all()
    
    trend_data = []
    for metric in metrics:
        trend_data.append({
            "period": metric.period_start,
            "value": metric.metric_value
        })
    
    # Calculate trend
    if len(trend_data) >= 2:
        recent_value = trend_data[-1]["value"]
        previous_value = trend_data[-2]["value"]
        
        if recent_value > previous_value:
            trend = "increasing"
        elif recent_value < previous_value:
            trend = "decreasing"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    return {
        "metric_name": metric_name,
        "trend": trend,
        "data": trend_data,
        "period_analyzed": f"{months} months"
    }


@router.post("/usage/track")
def track_usage_metric(
    metric_name: str,
    metric_value: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Track a usage metric"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
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
        existing.updated_at = datetime.utcnow().isoformat()
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


@router.get("/analytics/engagement")
def get_engagement_analytics(
    period: str = "current_month",
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get user engagement analytics"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    # Get period dates
    now = datetime.utcnow()
    if period == "current_month":
        period_start = now.replace(day=1)
    else:
        period_start = now - timedelta(days=30)
    
    # User engagement metrics
    total_users = db.exec(
        select(func.count(User.id)).where(User.tenant_id == current_user.tenant_id)
    ).first()
    
    active_users = db.exec(
        select(func.count(func.distinct(User.id)))
        .where(
            User.tenant_id == current_user.tenant_id,
            User.last_login >= period_start.isoformat()  # Assuming last_login field
        )
    ).first()
    
    # Role-based engagement
    role_stats = db.exec(
        select(User.role, func.count(User.id))
        .where(User.tenant_id == current_user.tenant_id)
        .group_by(User.role)
    ).all()
    
    # Feature engagement (from usage metrics)
    usage_metrics = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == current_user.tenant_id,
            UsageMetric.period_start >= period_start.isoformat()
        )
    ).all()
    
    feature_engagement = {}
    for metric in usage_metrics:
        if "operations" in metric.metric_name:
            feature = metric.metric_name.replace("_operations", "")
            feature_engagement[feature] = metric.metric_value
    
    engagement_rate = (active_users / total_users * 100) if total_users > 0 else 0
    
    return {
        "period": period,
        "total_users": total_users,
        "active_users": active_users or 0,
        "engagement_rate": engagement_rate,
        "role_distribution": {role: count for role, count in role_stats},
        "feature_engagement": feature_engagement
    }


# System-wide analytics (admin only)
@router.get("/admin/system-usage")
def get_system_usage_analytics(
    period: str = "current_month",
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get system-wide usage analytics"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get period dates
    now = datetime.utcnow()
    if period == "current_month":
        period_start = now.replace(day=1).isoformat()
    else:
        period_start = (now - timedelta(days=30)).isoformat()
    
    # Aggregate usage metrics across all tenants
    total_api_calls = db.exec(
        select(func.sum(UsageMetric.metric_value))
        .where(
            UsageMetric.metric_name == "api_calls",
            UsageMetric.period_start >= period_start
        )
    ).first() or 0
    
    total_storage = db.exec(
        select(func.sum(UsageMetric.metric_value))
        .where(
            UsageMetric.metric_name == "storage_mb",
            UsageMetric.period_start >= period_start
        )
    ).first() or 0
    
    # Tenant activity
    active_tenants = db.exec(
        select(func.count(func.distinct(UsageMetric.tenant_id)))
        .where(UsageMetric.period_start >= period_start)
    ).first()
    
    # Top features
    feature_usage = db.exec(
        select(UsageMetric.metric_name, func.sum(UsageMetric.metric_value))
        .where(
            UsageMetric.period_start >= period_start,
            UsageMetric.metric_name.like("%_operations")
        )
        .group_by(UsageMetric.metric_name)
        .order_by(func.sum(UsageMetric.metric_value).desc())
        .limit(10)
    ).all()
    
    top_features = [
        {"feature": name.replace("_operations", ""), "usage": count}
        for name, count in feature_usage
    ]
    
    # Growth metrics
    thirty_days_ago = now - timedelta(days=30)
    new_tenants = db.exec(
        select(func.count(Tenant.id))
        .where(Tenant.created_at >= thirty_days_ago.isoformat())
    ).first()
    
    return SystemUsageReport(
        period=period,
        total_tenants=active_tenants or 0,
        active_users=0,  # Would need user activity tracking
        total_api_calls=total_api_calls,
        storage_usage={
            "total_mb": total_storage,
            "average_per_tenant": total_storage / (active_tenants or 1)
        },
        top_features=top_features,
        growth_trends={
            "new_tenants_30_days": new_tenants,
            "api_growth": 0.0  # Would need historical comparison
        }
    )


@router.get("/admin/tenant-usage/{tenant_id}")
def get_tenant_usage_admin(
    tenant_id: int,
    period: str = "current_month",
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get usage analytics for specific tenant (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get period dates
    now = datetime.utcnow()
    if period == "current_month":
        period_start = now.replace(day=1).isoformat()
    else:
        period_start = (now - timedelta(days=30)).isoformat()
    
    # Get usage metrics
    metrics = db.exec(
        select(UsageMetric).where(
            UsageMetric.tenant_id == tenant_id,
            UsageMetric.period_start >= period_start
        )
    ).all()
    
    usage_data = {}
    for metric in metrics:
        usage_data[metric.metric_name] = metric.metric_value
    
    # Get subscription info
    subscription = db.exec(
        select(Subscription, Plan).join(Plan)
        .where(Subscription.tenant_id == tenant_id)
    ).first()
    
    plan_limits = {}
    if subscription:
        sub, plan = subscription
        plan_limits = {
            "max_users": plan.max_users,
            "max_schools": plan.max_schools,
            "max_storage_mb": plan.max_storage_mb if hasattr(plan, 'max_storage_mb') else 1000
        }
    
    # Current usage vs limits
    current_users = db.exec(
        select(func.count(User.id)).where(User.tenant_id == tenant_id)
    ).first()
    
    current_schools = db.exec(
        select(func.count(School.id)).where(School.tenant_id == tenant_id)
    ).first()
    
    usage_vs_limits = {
        "users": {"current": current_users, "limit": plan_limits.get("max_users")},
        "schools": {"current": current_schools, "limit": plan_limits.get("max_schools")},
        "storage_mb": {"current": usage_data.get("storage_mb", 0), "limit": plan_limits.get("max_storage_mb")}
    }
    
    return {
        "tenant": {"id": tenant.id, "name": tenant.name, "code": tenant.code},
        "period": period,
        "usage_metrics": usage_data,
        "plan_limits": plan_limits,
        "usage_vs_limits": usage_vs_limits,
        "subscription_status": subscription[0].status if subscription else "none"
    }
