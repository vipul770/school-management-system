from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime
from typing import List
import uuid
import re
from .db import get_db_session
from .models import User, Tenant, Role
from .saas_models import Subscription, Plan, SubscriptionStatus, BillingCycle
from .auth import get_password_hash, create_access_token, get_current_user
from pydantic import BaseModel, EmailStr
import secrets

router = APIRouter()


# Schemas for onboarding
class TenantRegistration(BaseModel):
    organization_name: str
    organization_type: str  # school, college, university, training_center
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    address: str
    city: str
    country: str
    admin_username: str
    admin_email: EmailStr
    admin_password: str
    plan_id: int


class TenantRegistrationResponse(BaseModel):
    tenant_id: int
    tenant_code: str
    admin_user_id: int
    subscription_id: int
    trial_end_date: str
    access_token: str


class OnboardingStep(BaseModel):
    step: str
    title: str
    description: str
    completed: bool
    required: bool


class OnboardingProgress(BaseModel):
    tenant_id: int
    current_step: int
    total_steps: int
    steps: List[OnboardingStep]
    completion_percentage: float


# Validation helpers
def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    pattern = r'^\+?[\d\s\-\(\)]+$'
    return re.match(pattern, phone) is not None


def generate_tenant_code(name: str) -> str:
    """Generate unique tenant code from organization name"""
    # Extract first 3 letters and add random digits
    base = ''.join(c for c in name if c.isalnum())[:3].upper()
    random_suffix = secrets.token_hex(2).upper()
    return f"{base}{random_suffix}"


@router.post("/register", response_model=TenantRegistrationResponse)
def register_tenant(
    registration: TenantRegistration,
    db: Session = Depends(get_db_session)
):
    """Register a new tenant with admin user and trial subscription"""
    
    # Validate input
    if not validate_email(registration.contact_email):
        raise HTTPException(status_code=400, detail="Invalid contact email")
    
    if not validate_email(registration.admin_email):
        raise HTTPException(status_code=400, detail="Invalid admin email")
    
    if not validate_phone(registration.contact_phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    
    # Check if admin username already exists
    existing_user = db.exec(
        select(User).where(User.username == registration.admin_username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if admin email already exists
    existing_email = db.exec(
        select(User).where(User.email == registration.admin_email)
    ).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Get plan details
    plan = db.get(Plan, registration.plan_id)
    if not plan or not plan.is_active:
        raise HTTPException(status_code=404, detail="Invalid or inactive plan")
    
    # Create tenant
    tenant_code = generate_tenant_code(registration.organization_name)
    
    # Ensure tenant code is unique
    while db.exec(select(Tenant).where(Tenant.code == tenant_code)).first():
        tenant_code = generate_tenant_code(registration.organization_name)
    
    tenant = Tenant(
        name=registration.organization_name,
        code=tenant_code,
        contact_email=registration.contact_email
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Create admin user
    admin_user = User(
        username=registration.admin_username,
        full_name=registration.contact_name,
        email=registration.admin_email,
        hashed_password=get_password_hash(registration.admin_password),
        role=Role.admin,
        tenant_id=tenant.id,
        must_change_password=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    # Create trial subscription
    trial_end = datetime.utcnow() + timedelta(days=14)  # 14-day trial
    
    subscription = Subscription(
        tenant_id=tenant.id,
        plan_id=registration.plan_id,
        status=SubscriptionStatus.trial,
        billing_cycle=BillingCycle.monthly,
        trial_ends_at=trial_end.isoformat(),
        current_period_start=datetime.utcnow().isoformat(),
        current_period_end=trial_end.isoformat()
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    # Create access token
    access_token = create_access_token(data={"sub": admin_user.username})
    
    # Initialize onboarding steps
    initialize_onboarding(tenant.id, db)
    
    return TenantRegistrationResponse(
        tenant_id=tenant.id,
        tenant_code=tenant_code,
        admin_user_id=admin_user.id,
        subscription_id=subscription.id,
        trial_end_date=trial_end.isoformat(),
        access_token=access_token
    )


def initialize_onboarding(tenant_id: int, db: Session):
    """Initialize onboarding steps for new tenant"""
    from .saas_models import TenantSettings
    
    steps = [
        {"step": "profile", "title": "Complete School Profile", "description": "Add school details and contact information", "completed": False, "required": True},
        {"step": "users", "title": "Add Users", "description": "Create accounts for teachers and staff", "completed": False, "required": True},
        {"step": "classes", "title": "Setup Classes", "description": "Create classes and subjects", "completed": False, "required": True},
        {"step": "students", "title": "Import Students", "description": "Add or import student data", "completed": False, "required": True},
        {"step": "timetable", "title": "Create Timetable", "description": "Setup class schedules", "completed": False, "required": False},
        {"step": "fees", "title": "Configure Fees", "description": "Setup fee structure", "completed": False, "required": False},
    ]
    
    for i, step in enumerate(steps):
        setting = TenantSettings(
            tenant_id=tenant_id,
            key=f"onboarding_step_{step['step']}",
            value=str({
                "step": step["step"],
                "title": step["title"],
                "description": step["description"],
                "completed": False,
                "required": step["required"],
                "order": i
            })
        )
        db.add(setting)
    
    # Set current step
    current_step = TenantSettings(
        tenant_id=tenant_id,
        key="onboarding_current_step",
        value="0"
    )
    db.add(current_step)
    
    db.commit()


@router.get("/onboarding/progress", response_model=OnboardingProgress)
def get_onboarding_progress(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get onboarding progress for current tenant"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    # Get onboarding steps
    steps_settings = db.exec(
        select(TenantSettings).where(
            TenantSettings.tenant_id == current_user.tenant_id,
            TenantSettings.key.like("onboarding_step_%")
        )
    ).all()
    
    # Get current step
    current_step_setting = db.exec(
        select(TenantSettings).where(
            TenantSettings.tenant_id == current_user.tenant_id,
            TenantSettings.key == "onboarding_current_step"
        )
    ).first()
    
    steps = []
    completed_count = 0
    
    for setting in sorted(steps_settings, key=lambda x: int(x.value.split('"order": ')[1].split(',')[0])):
        import json
        step_data = json.loads(setting.value)
        step = OnboardingStep(**step_data)
        steps.append(step)
        if step.completed:
            completed_count += 1
    
    current_step_index = int(current_step_setting.value) if current_step_setting else 0
    completion_percentage = (completed_count / len(steps)) * 100 if steps else 0
    
    return OnboardingProgress(
        tenant_id=current_user.tenant_id,
        current_step=current_step_index,
        total_steps=len(steps),
        steps=steps,
        completion_percentage=completion_percentage
    )


@router.post("/onboarding/complete-step")
def complete_onboarding_step(
    step_name: str,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Mark an onboarding step as completed"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    # Get step setting
    step_setting = db.exec(
        select(TenantSettings).where(
            TenantSettings.tenant_id == current_user.tenant_id,
            TenantSettings.key == f"onboarding_step_{step_name}"
        )
    ).first()
    
    if not step_setting:
        raise HTTPException(status_code=404, detail="Step not found")
    
    # Update step as completed
    import json
    step_data = json.loads(step_setting.value)
    step_data["completed"] = True
    step_setting.value = str(step_data)
    
    # Update current step
    current_step_setting = db.exec(
        select(TenantSettings).where(
            TenantSettings.tenant_id == current_user.tenant_id,
            TenantSettings.key == "onboarding_current_step"
        )
    ).first()
    
    if current_step_setting:
        current_step_index = int(current_step_setting.value)
        next_steps = db.exec(
            select(TenantSettings).where(
                TenantSettings.tenant_id == current_user.tenant_id,
                TenantSettings.key.like("onboarding_step_%")
            )
        ).all()
        
        # Find next incomplete step
        next_index = current_step_index + 1
        for i, setting in enumerate(sorted(next_steps, key=lambda x: int(x.value.split('"order": ')[1].split(',')[0]))):
            if i > current_step_index:
                step_data = json.loads(setting.value)
                if not step_data.get("completed", False):
                    next_index = i
                    break
        
        current_step_setting.value = str(next_index)
    
    db.commit()
    
    return {"message": "Step marked as completed"}


@router.get("/check-availability")
def check_availability(
    username: str = None,
    email: str = None,
    tenant_code: str = None,
    db: Session = Depends(get_db_session)
):
    """Check availability of username, email, or tenant code"""
    results = {}
    
    if username:
        existing = db.exec(select(User).where(User.username == username)).first()
        results["username_available"] = existing is None
    
    if email:
        existing = db.exec(select(User).where(User.email == email)).first()
        results["email_available"] = existing is None
    
    if tenant_code:
        existing = db.exec(select(Tenant).where(Tenant.code == tenant_code)).first()
        results["tenant_code_available"] = existing is None
    
    return results


@router.get("/plans")
def get_available_plans(db: Session = Depends(get_db_session)):
    """Get available plans for registration"""
    plans = db.exec(select(Plan).where(Plan.is_active == True)).all()
    return plans
