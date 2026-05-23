from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON


class PlanType(str, Enum):
    free = 'free'
    basic = 'basic'
    professional = 'professional'
    enterprise = 'enterprise'


class BillingCycle(str, Enum):
    monthly = 'monthly'
    yearly = 'yearly'


class SubscriptionStatus(str, Enum):
    trial = 'trial'
    active = 'active'
    expired = 'expired'
    cancelled = 'cancelled'


class SchoolRegistrationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class SchoolRegistrationRequest(SQLModel, table=True):
    """School registration request for SaaS model"""
    __tablename__ = "school_registration_requests"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    school_name: str = Field(index=True)
    admin_name: str
    admin_email: str
    admin_phone: str
    school_address: str
    school_city: str
    school_state: str
    school_country: str
    school_postal_code: str
    school_phone: str
    school_email: str
    school_website: Optional[str] = None
    school_type: str  # public, private, charter, international
    student_capacity: int
    grades_offered: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    registration_date: datetime = Field(default_factory=datetime.utcnow)
    status: SchoolRegistrationStatus = Field(default=SchoolRegistrationStatus.PENDING)
    approved_date: Optional[datetime] = None
    approved_by: Optional[int] = Field(foreign_key="user.id")
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None
    invitation_token: Optional[str] = None
    invitation_expires: Optional[datetime] = None
    
    # Relationships
    approver: Optional["User"] = Relationship()


class SchoolInvitation(SQLModel, table=True):
    """Invitation sent to schools to register"""
    __tablename__ = "school_invitations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    invitation_code: str = Field(unique=True, index=True)
    invited_email: str = Field(index=True)
    invited_by: int = Field(foreign_key="user.id")
    school_name_hint: Optional[str] = None
    message: Optional[str] = None
    status: str = Field(default="pending")  # pending, accepted, expired, revoked
    sent_date: datetime = Field(default_factory=datetime.utcnow)
    accepted_date: Optional[datetime] = None
    expires_date: datetime
    max_uses: int = Field(default=1)
    times_used: int = Field(default=0)
    
    # Relationships
    inviter: "User" = Relationship()


class Plan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: PlanType = PlanType.free
    description: Optional[str] = None
    price_monthly: Optional[float] = 0.0
    price_yearly: Optional[float] = 0.0
    max_users: Optional[int] = None
    max_schools: Optional[int] = None
    features: Optional[str] = None  # JSON string of features
    is_active: bool = True
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Subscription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key='tenant.id', index=True)
    plan_id: int = Field(foreign_key='plan.id', index=True)
    status: SubscriptionStatus = SubscriptionStatus.trial
    billing_cycle: BillingCycle = BillingCycle.monthly
    trial_ends_at: Optional[str] = None
    current_period_start: Optional[str] = None
    current_period_end: Optional[str] = None
    cancelled_at: Optional[str] = None
    auto_renew: bool = True
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key='tenant.id', index=True)
    subscription_id: int = Field(foreign_key='subscription.id', index=True)
    invoice_number: str = Field(unique=True, index=True)
    amount: float
    currency: str = 'USD'
    status: str = 'pending'  # pending, paid, failed, cancelled
    due_date: Optional[str] = None
    paid_at: Optional[str] = None
    payment_method: Optional[str] = None
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PaymentMethod(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key='tenant.id', index=True)
    type: str  # card, bank_transfer, etc.
    provider: str  # stripe, paypal, etc.
    provider_id: Optional[str] = None
    last_four: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    is_default: bool = False
    is_active: bool = True
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class UsageMetric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key='tenant.id', index=True)
    metric_name: str  # api_calls, storage, users, etc.
    metric_value: int
    period_start: str
    period_end: str
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


class TenantSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key='tenant.id', index=True)
    key: str
    value: Optional[str] = None
    created_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())


# Schemas for API
class PlanCreate(SQLModel):
    name: str
    type: PlanType
    description: Optional[str] = None
    price_monthly: Optional[float] = 0.0
    price_yearly: Optional[float] = 0.0
    max_users: Optional[int] = None
    max_schools: Optional[int] = None
    features: Optional[str] = None


class PlanRead(SQLModel):
    id: int
    name: str
    type: PlanType
    description: Optional[str] = None
    price_monthly: Optional[float]
    price_yearly: Optional[float]
    max_users: Optional[int]
    max_schools: Optional[int]
    features: Optional[str]
    is_active: bool


class SubscriptionCreate(SQLModel):
    plan_id: int
    billing_cycle: BillingCycle = BillingCycle.monthly


class SubscriptionRead(SQLModel):
    id: int
    tenant_id: int
    plan: PlanRead
    status: SubscriptionStatus
    billing_cycle: BillingCycle
    trial_ends_at: Optional[str]
    current_period_start: Optional[str]
    current_period_end: Optional[str]
    auto_renew: bool
    created_at: str


class InvoiceRead(SQLModel):
    id: int
    invoice_number: str
    amount: float
    currency: str
    status: str
    due_date: Optional[str]
    paid_at: Optional[str]
    created_at: str
