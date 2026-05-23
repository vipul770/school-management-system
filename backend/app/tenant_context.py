from fastapi import HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from .models import User, Tenant
from .saas_models import Subscription, SubscriptionStatus


class TenantContext:
    """Tenant context for multi-tenant isolation"""
    
    def __init__(self, tenant_id: Optional[int] = None):
        self.tenant_id = tenant_id
        self.tenant: Optional[Tenant] = None
        self.subscription: Optional[Subscription] = None
    
    @classmethod
    def from_user(cls, user: User, db: Session) -> "TenantContext":
        """Create tenant context from user"""
        if not user.tenant_id:
            raise HTTPException(
                status_code=403,
                detail="User not associated with any tenant"
            )
        
        context = cls(tenant_id=user.tenant_id)
        
        # Get tenant
        context.tenant = db.get(Tenant, user.tenant_id)
        if not context.tenant:
            raise HTTPException(
                status_code=404,
                detail="Tenant not found"
            )
        
        # Get subscription
        context.subscription = db.exec(
            select(Subscription).where(Subscription.tenant_id == user.tenant_id)
        ).first()
        
        # Check subscription status
        if context.subscription and context.subscription.status == SubscriptionStatus.expired:
            raise HTTPException(
                status_code=403,
                detail="Subscription expired. Please renew to continue."
            )
        
        if context.subscription and context.subscription.status == SubscriptionStatus.suspended:
            raise HTTPException(
                status_code=403,
                detail="Account suspended. Please contact support."
            )
        
        return context
    
    def check_user_limit(self, current_count: int) -> bool:
        """Check if tenant is within user limit"""
        if not self.subscription:
            return True  # No subscription, no limit
        
        # Get plan details
        # This would need to be implemented based on your plan model
        max_users = 100  # Default limit
        
        return current_count <= max_users
    
    def check_feature_access(self, feature: str) -> bool:
        """Check if tenant has access to specific feature"""
        if not self.subscription:
            return True  # No subscription, all features available
        
        # Check based on plan type
        # This would need to be implemented based on your plan features
        return True
    
    def get_tenant_filter(self, model_class):
        """Get tenant filter for queries"""
        if hasattr(model_class, 'tenant_id'):
            return model_class.tenant_id == self.tenant_id
        return None


def get_tenant_context(user: User, db: Session) -> TenantContext:
    """Dependency to get tenant context"""
    return TenantContext.from_user(user, db)


def require_subscription(user: User, db: Session) -> TenantContext:
    """Dependency that requires active subscription"""
    context = get_tenant_context(user, db)
    
    if not context.subscription:
        raise HTTPException(
            status_code=403,
            detail="Active subscription required for this feature"
        )
    
    if context.subscription.status != SubscriptionStatus.active:
        raise HTTPException(
            status_code=403,
            detail="Subscription not active"
        )
    
    return context


# Query helpers for multi-tenant isolation
def get_tenant_query(db: Session, model_class, tenant_context: TenantContext):
    """Get query filtered by tenant"""
    query = select(model_class)
    
    tenant_filter = tenant_context.get_tenant_filter(model_class)
    if tenant_filter:
        query = query.where(tenant_filter)
    
    return query


def create_tenant_resource(model_class, tenant_context: TenantContext, **kwargs):
    """Create resource with tenant context"""
    if hasattr(model_class, 'tenant_id'):
        kwargs['tenant_id'] = tenant_context.tenant_id
    
    return model_class(**kwargs)
