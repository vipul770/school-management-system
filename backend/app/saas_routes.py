"""
SaaS routes for school registration, invitation, and management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timedelta
import secrets
import string

from .db import get_session
from .models import User, Role, Tenant, School
from .saas_models import (
    SchoolRegistrationRequest, SchoolInvitation, Plan, PlanType,
    SchoolRegistrationStatus
)
from .auth import get_current_user, get_password_hash, create_access_token
from .email_utils import send_school_approval_email

saas_router = APIRouter(prefix="/saas", tags=["SaaS Management"])

def generate_invitation_code():
    """Generate a unique invitation code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))


def generate_temp_password(length: int = 12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_unique_username(session: Session, email: str):
    base_username = email.split('@')[0].strip() or "schooladmin"
    candidate = base_username
    suffix = 1
    while session.exec(select(User).where(User.username == candidate)).first():
        suffix += 1
        candidate = f"{base_username}{suffix}"
    return candidate

@saas_router.post("/invite-school")
def invite_school(
    invitation_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Send invitation to a school to register"""
    if current_user.role != Role.superadmin:
        raise HTTPException(status_code=403, detail="Only superadmin can invite schools")
    
    # Check if invitation already exists
    existing = session.exec(
        select(SchoolInvitation).where(SchoolInvitation.invited_email == invitation_data["email"])
    ).first()
    
    if existing and existing.status == "pending":
        raise HTTPException(status_code=400, detail="Invitation already sent to this email")
    
    # Create invitation
    invitation = SchoolInvitation(
        invitation_code=generate_invitation_code(),
        invited_email=invitation_data["email"],
        invited_by=current_user.id,
        school_name_hint=invitation_data.get("school_name_hint"),
        message=invitation_data.get("message"),
        expires_date=datetime.utcnow() + timedelta(days=30)
    )
    
    session.add(invitation)
    session.commit()
    session.refresh(invitation)
    
    # TODO: Send invitation email
    
    return {
        "success": True,
        "invitation_code": invitation.invitation_code,
        "message": "Invitation sent successfully"
    }

@saas_router.post("/register-school")
def register_school(
    registration_data: dict,
    invitation_code: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Register a new school (with or without invitation)"""
    
    # Validate invitation if provided
    if invitation_code:
        invitation = session.exec(
            select(SchoolInvitation).where(
                SchoolInvitation.invitation_code == invitation_code,
                SchoolInvitation.status == "pending",
                SchoolInvitation.expires_date > datetime.utcnow()
            )
        ).first()
        
        if not invitation:
            raise HTTPException(status_code=400, detail="Invalid or expired invitation code")
        
        if invitation.times_used >= invitation.max_uses:
            raise HTTPException(status_code=400, detail="Invitation code has been fully used")
    
    # Check if registration already exists
    existing = session.exec(
        select(SchoolRegistrationRequest).where(
            SchoolRegistrationRequest.admin_email == registration_data["admin_email"]
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Registration request already exists")
    
    # Create registration request
    registration = SchoolRegistrationRequest(
        school_name=registration_data["school_name"],
        admin_name=registration_data["admin_name"],
        admin_email=registration_data["admin_email"],
        admin_phone=registration_data["admin_phone"],
        school_address=registration_data["school_address"],
        school_city=registration_data["school_city"],
        school_state=registration_data["school_state"],
        school_country=registration_data["school_country"],
        school_postal_code=registration_data["school_postal_code"],
        school_phone=registration_data["school_phone"],
        school_email=registration_data["school_email"],
        school_website=registration_data.get("school_website"),
        school_type=registration_data["school_type"],
        student_capacity=registration_data["student_capacity"],
        grades_offered=registration_data.get("grades_offered", []),
        notes=registration_data.get("notes")
    )
    
    session.add(registration)
    session.commit()
    session.refresh(registration)
    
    # Update invitation usage if applicable
    if invitation_code:
        invitation.times_used += 1
        if invitation.times_used >= invitation.max_uses:
            invitation.status = "fully_used"
        session.commit()
    
    # TODO: Send confirmation email
    
    return {
        "success": True,
        "registration_id": registration.id,
        "message": "Registration request submitted. Awaiting approval."
    }

@saas_router.get("/registration-requests")
def list_registration_requests(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    status: Optional[str] = None
):
    """List school registration requests (superadmin only)"""
    if current_user.role != Role.superadmin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = select(SchoolRegistrationRequest)
    if status:
        query = query.where(SchoolRegistrationRequest.status == status)
    
    requests = session.exec(query.order_by(SchoolRegistrationRequest.registration_date.desc())).all()
    return requests

@saas_router.post("/approve-registration/{request_id}")
def approve_registration(
    request_id: int,
    approval_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Approve a school registration request"""
    if current_user.role != Role.superadmin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    registration = session.get(SchoolRegistrationRequest, request_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration request not found")
    
    if registration.status != SchoolRegistrationStatus.PENDING:
        raise HTTPException(status_code=400, detail="Registration request already processed")
    
    # Create tenant
    tenant_code = f"SCH{registration.id:04d}"
    tenant = Tenant(
        name=registration.school_name,
        code=tenant_code,
        domain=f"{tenant_code.lower()}.schoolms.com",
        is_active=True
    )
    
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    
    # Create school
    school = School(
        name=registration.school_name,
        tenant_id=tenant.id,
        address=registration.school_address,
        city=registration.school_city,
        state=registration.school_state,
        country=registration.school_country,
        postal_code=registration.school_postal_code,
        phone=registration.school_phone,
        email=registration.school_email,
        website=registration.school_website,
        type=registration.school_type,
        student_capacity=registration.student_capacity,
        is_active=True
    )
    
    session.add(school)
    session.commit()
    session.refresh(school)
    
    temp_password = approval_data.get("temp_password") or generate_temp_password()
    admin_username = generate_unique_username(session, registration.admin_email)

    # Create school admin user
    admin_user = User(
        username=admin_username,
        full_name=registration.admin_name,
        email=registration.admin_email,
        hashed_password=get_password_hash(temp_password),
        role=Role.school,  # School admin role
        tenant_id=tenant.id,
        school_id=school.id,
        must_change_password=True,
    )
    
    session.add(admin_user)
    session.commit()
    session.refresh(admin_user)
    
    # Update registration status
    registration.status = SchoolRegistrationStatus.APPROVED
    registration.approved_date = datetime.utcnow()
    registration.approved_by = current_user.id
    
    session.commit()
    
    recipient_emails = []
    for email in [registration.admin_email, registration.school_email]:
        if email and email not in recipient_emails:
            recipient_emails.append(email)

    email_results = []
    for email in recipient_emails:
        sent, error = send_school_approval_email(
            to_email=email,
            admin_name=registration.admin_name,
            school_name=registration.school_name,
            organisation_code=tenant_code,
            username=admin_user.username,
            temp_password=temp_password,
        )
        email_results.append({
            "email": email,
            "sent": sent,
            "error": error,
        })
    
    return {
        "success": True,
        "tenant_code": tenant_code,
        "school_id": school.id,
        "admin_user_id": admin_user.id,
        "admin_username": admin_user.username,
        "credentials_email_sent": all(item["sent"] for item in email_results) if email_results else False,
        "credentials_email_error": next((item["error"] for item in email_results if item["error"]), None),
        "credentials_email_results": email_results,
        "message": "School registration approved successfully"
    }

@saas_router.post("/reject-registration/{request_id}")
def reject_registration(
    request_id: int,
    rejection_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Reject a school registration request"""
    if current_user.role != Role.superadmin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    registration = session.get(SchoolRegistrationRequest, request_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration request not found")
    
    if registration.status != SchoolRegistrationStatus.PENDING:
        raise HTTPException(status_code=400, detail="Registration request already processed")
    
    registration.status = SchoolRegistrationStatus.REJECTED
    registration.rejection_reason = rejection_data.get("reason")
    registration.approved_by = current_user.id
    
    session.commit()
    
    # TODO: Send rejection email
    
    return {
        "success": True,
        "message": "School registration rejected"
    }

@saas_router.get("/my-schools")
def get_my_schools(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get schools associated with current user"""
    if current_user.role == Role.superadmin:
        # Superadmin can see all schools
        schools = session.exec(select(School)).all()
    elif current_user.role == Role.school:
        # School admin can see their school
        schools = session.exec(select(School).where(School.id == current_user.school_id)).all()
    else:
        # Other roles can see their school
        schools = session.exec(select(School).where(School.id == current_user.school_id)).all()
    
    return schools

@saas_router.get("/invitations")
def list_invitations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List sent invitations (superadmin only)"""
    if current_user.role != Role.superadmin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    invitations = session.exec(
        select(SchoolInvitation).order_by(SchoolInvitation.sent_date.desc())
    ).all()
    
    return invitations

@saas_router.post("/revoke-invitation/{invitation_id}")
def revoke_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Revoke an invitation"""
    if current_user.role != Role.superadmin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    invitation = session.get(SchoolInvitation, invitation_id)
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    invitation.status = "revoked"
    session.commit()
    
    return {"success": True, "message": "Invitation revoked"}
