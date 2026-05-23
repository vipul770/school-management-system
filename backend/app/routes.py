from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
import re
import secrets
from .db import get_session
from .models import User, UserBase, UserCreate, Role, Tenant, School, Student, ClassRoom
from .models import TenantRequest, TenantRequestStatus, UserRequest, UserRequestStatus
from .auth import authenticate_user, create_access_token, get_password_hash, requires_role, get_current_user
from fastapi import status

router = APIRouter()


def ensure_school_access(current: User, school_id: int):
    if current.role == Role.superadmin:
        return
    if current.school_id and current.school_id == school_id:
        return
    raise HTTPException(status_code=403, detail='Not allowed to access this school')


class LoginPayload(BaseModel):
    username: str
    password: str


class OrganisationValidationPayload(BaseModel):
    organisation_id: str


class ForgotPasswordPayload(BaseModel):
    tenant_id: int
    username: str
    new_password: str


class ChangePasswordPayload(BaseModel):
    new_password: str


class OrganisationUserCreatePayload(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: str
    email: Optional[str] = None
    role: Role
    school_id: Optional[int] = None
    classroom_id: Optional[int] = None


class ClassroomCreatePayload(BaseModel):
    name: str


class ClassroomUpdatePayload(BaseModel):
    name: Optional[str] = None
    class_teacher_user_id: Optional[int] = None


class StudentCreatePayload(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    classroom_id: Optional[int] = None


class TeacherCreatePayload(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    classroom_id: Optional[int] = None


class ClassroomSummary(BaseModel):
    id: int
    name: str
    tenant_id: Optional[int] = None
    school_id: Optional[int] = None
    class_teacher_user_id: Optional[int] = None
    class_teacher_name: Optional[str] = None
    student_count: int = 0


class ClassroomDetails(ClassroomSummary):
    students: list[dict] = []


ORG_MANAGED_ROLES = {
    Role.student,
    Role.teacher,
    Role.parent,
    Role.accountant,
    Role.librarian,
}


def _slug_username(value: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '.', (value or '').strip().lower()).strip('.')
    return slug or 'user'


def _build_unique_username(session: Session, base: str) -> str:
    candidate = _slug_username(base)
    if len(candidate) < 3:
        candidate = f"user{candidate}"
    username = candidate
    counter = 1
    while session.exec(select(User).where(User.username == username)).first():
        username = f"{candidate}{counter}"
        counter += 1
    return username


def _ensure_tenant_code(session: Session, tenant: Tenant) -> Tenant:
    if tenant.code:
        return tenant
    tenant.code = f"ORG-{tenant.id}-{secrets.token_hex(3)}"
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return tenant


def _get_school_or_404(session: Session, school_id: int) -> School:
    school = session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=404, detail='School not found')
    return school


def _get_classroom_or_404(session: Session, classroom_id: int) -> ClassRoom:
    classroom = session.get(ClassRoom, classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail='Classroom not found')
    return classroom


def _serialize_student(session: Session, student: Student) -> dict:
    user = session.get(User, student.user_id) if student.user_id else None
    return {
        'id': student.id,
        'user_id': student.user_id,
        'classroom_id': student.classroom_id,
        'school_id': student.school_id,
        'tenant_id': student.tenant_id,
        'username': user.username if user else None,
        'full_name': user.full_name if user else None,
        'email': user.email if user else None,
    }


def _serialize_teacher(user: User, classroom: Optional[ClassRoom] = None) -> dict:
    return {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'email': user.email,
        'role': user.role,
        'school_id': user.school_id,
        'tenant_id': user.tenant_id,
        'classroom_id': classroom.id if classroom else None,
        'classroom_name': classroom.name if classroom else None,
    }


@router.post('/auth/validate-organisation')
def validate_organisation(payload: OrganisationValidationPayload, session: Session = Depends(get_session)):
    org_id = (payload.organisation_id or '').strip()
    if not org_id:
        raise HTTPException(status_code=400, detail='Organisation ID is required')

    tenant = session.exec(select(Tenant).where(Tenant.code == org_id)).first()
    if tenant is None and org_id.isdigit():
        numeric_id = int(org_id)
        tenant = session.get(Tenant, numeric_id)
        if tenant is None:
            school = session.get(School, numeric_id)
            if school and school.tenant_id:
                tenant = session.get(Tenant, school.tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail='Invalid organisation ID')

    return {
        'success': True,
        'tenant': {
            'id': tenant.id,
            'name': tenant.name,
            'code': tenant.code,
        }
    }


@router.post('/auth/forgot-password')
def forgot_password(payload: ForgotPasswordPayload, session: Session = Depends(get_session)):
    username = (payload.username or '').strip()
    if not username:
        raise HTTPException(status_code=400, detail='Username is required')
    if not payload.tenant_id:
        raise HTTPException(status_code=400, detail='Organisation is required')
    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail='New password must be at least 6 characters')

    user = session.exec(
        select(User).where(
            User.username == username,
            User.tenant_id == payload.tenant_id,
        )
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found for this organisation')

    user.hashed_password = get_password_hash(payload.new_password)
    user.must_change_password = False
    session.add(user)
    session.commit()
    return {'success': True, 'message': 'Password updated successfully'}


@router.post('/auth/change-password')
def change_password(
    payload: ChangePasswordPayload,
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail='New password must be at least 6 characters')

    db_user = session.get(User, current.id)
    if not db_user:
        raise HTTPException(status_code=404, detail='User not found')

    db_user.hashed_password = get_password_hash(payload.new_password)
    db_user.must_change_password = False
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return {'success': True, 'message': 'Password changed successfully'}


@router.post('/auth/register')
def register(user: UserCreate, session: Session = Depends(get_session)):
    # If role is admin or school, create a pending UserRequest for superadmin approval
    if user.role in (Role.admin, Role.school):
        stmt = select(UserRequest).where(UserRequest.username == user.username)
        exists = session.exec(stmt).first()
        if exists:
            raise HTTPException(status_code=400, detail='A request or user with that username already exists')
        hashed = get_password_hash(user.password)
        req = UserRequest(
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            tenant_id=user.tenant_id,
            school_id=user.school_id,
            hashed_password=hashed,
            must_change_password=True,
            details=None,
        )
        session.add(req)
        session.commit()
        session.refresh(req)
        return {'success': True, 'message': 'Account request submitted for approval', 'request_id': req.id}

    # otherwise create user directly
    statement = select(User).where(User.username == user.username)
    exists = session.exec(statement).first()
    if exists:
        raise HTTPException(status_code=400, detail='Username already exists')
    hashed = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        tenant_id=user.tenant_id,
        school_id=user.school_id,
        hashed_password=hashed,
        must_change_password=True,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {
        'success': True,
        'message': 'User registered successfully',
        'user': {
            'id': db_user.id,
            'username': db_user.username,
            'role': db_user.role,
            'full_name': db_user.full_name,
            'email': db_user.email,
            'tenant_id': db_user.tenant_id,
            'school_id': db_user.school_id,
        }
    }


@router.post('/auth/token')
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    access_token = create_access_token({'sub': user.username})
    return {
        'success': True,
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
            'tenant_id': user.tenant_id,
            'school_id': user.school_id,
            'must_change_password': user.must_change_password,
        }
    }


@router.post('/auth/login')
def login_json(payload: LoginPayload, session: Session = Depends(get_session)):
    user = authenticate_user(session, payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    access_token = create_access_token({'sub': user.username})
    return {
        'success': True,
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
            'tenant_id': user.tenant_id,
            'school_id': user.school_id,
            'must_change_password': user.must_change_password,
        }
    }





@router.post('/school/{school_id}/students')
def add_student(school_id: int, username: str, current=Depends(requires_role(Role.school, Role.admin)), session: Session = Depends(get_session)):
    student = Student(user_id=None, school_id=school_id)
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


@router.post('/admin/tenants', response_model=Tenant)
def create_tenant(tenant: Tenant, current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return tenant


@router.get('/admin/tenants', response_model=list[Tenant])
def list_tenants(current=Depends(requires_role(Role.superadmin, Role.admin)), session: Session = Depends(get_session)):
    return session.exec(select(Tenant)).all()


@router.post('/requests/tenants')
def create_tenant_request(payload: TenantRequest, current=Depends(get_current_user), session: Session = Depends(get_session)):
    # Any authenticated user (typically school admin) can create a tenant request
    req = TenantRequest(
        name=payload.name,
        contact_email=payload.contact_email,
        requested_by=current.id,
        details=payload.details,
    )
    session.add(req)
    session.commit()
    session.refresh(req)
    return {'id': req.id, 'name': req.name, 'status': req.status}


@router.get('/admin/requests', response_model=list[TenantRequest])
def list_tenant_requests(current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    return session.exec(select(TenantRequest).order_by(TenantRequest.id.desc())).all()


@router.post('/admin/requests/{request_id}/approve')
def approve_tenant_request(request_id: int, current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    req = session.get(TenantRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status != TenantRequestStatus.pending:
        raise HTTPException(status_code=400, detail='Request already processed')
    # create tenant
    tenant = Tenant(name=req.name, contact_email=req.contact_email)
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    # generate organisation code
    tenant = _ensure_tenant_code(session, tenant)
    # create a school tied to tenant
    school = School(name=req.name, tenant_id=tenant.id)
    session.add(school)
    # update request
    req.status = TenantRequestStatus.approved
    session.add(req)
    session.commit()
    session.refresh(tenant)
    session.refresh(school)
    return {'tenant_id': tenant.id, 'code': tenant.code, 'school_id': school.id}


@router.post('/admin/requests/{request_id}/reject')
def reject_tenant_request(request_id: int, reason: Optional[str] = None, current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    req = session.get(TenantRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status != TenantRequestStatus.pending:
        raise HTTPException(status_code=400, detail='Request already processed')
    req.status = TenantRequestStatus.rejected
    if reason:
        req.details = (req.details or "") + "\nRejection reason: " + reason
    session.add(req)
    session.commit()
    return {'id': req.id, 'status': req.status}


@router.get('/admin/user-requests', response_model=list[UserRequest])
def list_user_requests(current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    return session.exec(
        select(UserRequest)
        .where(UserRequest.status == UserRequestStatus.pending)
        .order_by(UserRequest.id.desc())
    ).all()


@router.post('/admin/user-requests/{request_id}/approve')
def approve_user_request(request_id: int, current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    req = session.get(UserRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail='User request not found')
    if req.status != UserRequestStatus.pending:
        raise HTTPException(status_code=400, detail='Request already processed')
    # ensure username still free
    existing = session.exec(select(User).where(User.username == req.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail='Username already taken')

    # Resolve tenant/school linkage for school/admin requests so approved users are fully scoped.
    resolved_tenant_id = req.tenant_id
    if req.role in (Role.school, Role.admin) and not resolved_tenant_id:
        tenant_name = (req.full_name or req.username or 'New Organisation').strip()
        tenant = Tenant(name=tenant_name, contact_email=req.email)
        session.add(tenant)
        session.commit()
        session.refresh(tenant)
        tenant = _ensure_tenant_code(session, tenant)
        resolved_tenant_id = tenant.id

    resolved_school_id = req.school_id
    if req.role in (Role.school, Role.admin):
        if resolved_school_id:
            school = session.get(School, resolved_school_id)
            if not school:
                raise HTTPException(status_code=404, detail='Selected school not found')
            if resolved_tenant_id and school.tenant_id != resolved_tenant_id:
                school.tenant_id = resolved_tenant_id
                session.add(school)
                session.commit()
        else:
            school_name = (req.full_name or req.username or 'New School').strip()
            preferred_school_id = resolved_tenant_id
            if preferred_school_id and not session.get(School, preferred_school_id):
                school = School(id=preferred_school_id, name=school_name, tenant_id=resolved_tenant_id)
            else:
                school = School(name=school_name, tenant_id=resolved_tenant_id)
            session.add(school)
            session.commit()
            session.refresh(school)
            resolved_school_id = school.id
    # create actual user
    user = User(
        username=req.username,
        full_name=req.full_name,
        email=req.email,
        role=req.role,
        tenant_id=resolved_tenant_id,
        school_id=resolved_school_id,
        hashed_password=req.hashed_password,
        must_change_password=True,
    )
    session.add(user)
    # mark request approved
    req.status = UserRequestStatus.approved
    session.add(req)
    session.commit()
    session.refresh(user)
    return {'user_id': user.id, 'username': user.username}


@router.post('/admin/user-requests/{request_id}/reject')
def reject_user_request(request_id: int, current=Depends(requires_role(Role.superadmin)), session: Session = Depends(get_session)):
    req = session.get(UserRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail='User request not found')
    if req.status != UserRequestStatus.pending:
        raise HTTPException(status_code=400, detail='Request already processed')
    session.delete(req)
    session.commit()
    return {'id': request_id, 'status': UserRequestStatus.rejected}


@router.post('/admin/tenants/{tenant_id}/schools', response_model=School)
def create_tenant_school(tenant_id: int, school: School, current=Depends(requires_role(Role.superadmin, Role.admin)), session: Session = Depends(get_session)):
    school.tenant_id = tenant_id
    session.add(school)
    session.commit()
    session.refresh(school)
    return school


@router.get('/admin/tenants/{tenant_id}/schools', response_model=list[School])
def list_tenant_schools(tenant_id: int, current=Depends(requires_role(Role.superadmin, Role.admin)), session: Session = Depends(get_session)):
    return session.exec(select(School).where(School.tenant_id == tenant_id)).all()


@router.post('/admin/schools', response_model=School)
def create_school(school: School, current=Depends(requires_role(Role.superadmin, Role.admin)), session: Session = Depends(get_session)):
    session.add(school)
    session.commit()
    session.refresh(school)
    return school


# Development helper: create school without auth (for initial UI testing)
@router.post('/admin/schools/dev', response_model=School)
def create_school_dev(school: School, session: Session = Depends(get_session)):
    session.add(school)
    session.commit()
    session.refresh(school)
    return school


@router.get('/admin/schools', response_model=list[School])
def list_schools_public(current=Depends(get_current_user), session: Session = Depends(get_session)):
    if current.role == Role.superadmin:
        return session.exec(select(School)).all()
    if current.role in (Role.admin, Role.school):
        if not current.school_id:
            return []
        return session.exec(select(School).where(School.id == current.school_id)).all()
    raise HTTPException(status_code=403, detail='Operation forbidden for your role')


@router.post('/admin/users')
def create_user(user: UserCreate, current=Depends(requires_role(Role.superadmin, Role.admin)), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == user.username)
    exists = session.exec(statement).first()
    if exists:
        raise HTTPException(status_code=400, detail='Username already exists')

    resolved_tenant_id = user.tenant_id
    resolved_school_id = user.school_id

    # School/Admin users must be linked to a valid school; create one for superadmin if not provided.
    if user.role in (Role.admin, Role.school):
        if resolved_school_id:
            school = session.get(School, resolved_school_id)
            if not school:
                raise HTTPException(status_code=404, detail='Selected school not found')
            if current.role != Role.superadmin and current.school_id != school.id:
                raise HTTPException(status_code=403, detail='Not allowed to create user for this school')
            if resolved_tenant_id and school.tenant_id and resolved_tenant_id != school.tenant_id:
                raise HTTPException(status_code=400, detail='school_id does not belong to tenant_id')
            resolved_tenant_id = resolved_tenant_id or school.tenant_id or current.tenant_id
            if school.tenant_id is None and resolved_tenant_id:
                school.tenant_id = resolved_tenant_id
                session.add(school)
                session.commit()
        else:
            if current.role == Role.superadmin:
                if not resolved_tenant_id:
                    tenant_name = (user.full_name or user.username or 'New Organisation').strip()
                    tenant = Tenant(name=tenant_name, contact_email=user.email)
                    session.add(tenant)
                    session.commit()
                    session.refresh(tenant)
                    tenant = _ensure_tenant_code(session, tenant)
                    resolved_tenant_id = tenant.id
                else:
                    existing_tenant = session.get(Tenant, resolved_tenant_id)
                    if existing_tenant:
                        _ensure_tenant_code(session, existing_tenant)

                school_name = (user.full_name or user.username or 'New School').strip()
                preferred_school_id = resolved_tenant_id
                if preferred_school_id and not session.get(School, preferred_school_id):
                    school = School(id=preferred_school_id, name=school_name, tenant_id=resolved_tenant_id)
                else:
                    school = School(name=school_name, tenant_id=resolved_tenant_id)
                session.add(school)
                session.commit()
                session.refresh(school)
                resolved_school_id = school.id
            else:
                if not current.school_id:
                    raise HTTPException(status_code=400, detail='Current admin is not linked to any school')
                resolved_school_id = current.school_id
                resolved_tenant_id = current.tenant_id

    hashed = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        tenant_id=resolved_tenant_id,
        school_id=resolved_school_id,
        hashed_password=hashed,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    tenant_code = None
    if db_user.tenant_id:
        tenant = session.get(Tenant, db_user.tenant_id)
        if tenant:
            tenant_code = tenant.code
    return {
        'id': db_user.id,
        'username': db_user.username,
        'role': db_user.role,
        'tenant_id': db_user.tenant_id,
        'school_id': db_user.school_id,
        'organisation_code': tenant_code,
    }


@router.get('/admin/users')
def list_users(current=Depends(requires_role(Role.superadmin, Role.admin, Role.school)), session: Session = Depends(get_session)):
    if current.role == Role.superadmin:
        users = session.exec(select(User)).all()
    else:
        users = session.exec(select(User).where(User.tenant_id == current.tenant_id)).all()
    result = []
    for u in users:
        result.append({
            'id': u.id,
            'username': u.username,
            'full_name': u.full_name,
            'email': u.email,
            'role': u.role,
            'tenant_id': u.tenant_id,
            'school_id': u.school_id,
        })
    return result


@router.get('/users/{user_id}')
def get_user(user_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check access
    if current.role not in ['superadmin', 'admin'] and user.tenant_id != current.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'email': user.email,
        'role': user.role,
        'tenant_id': user.tenant_id,
        'school_id': user.school_id,
    }


@router.post('/organisation/users')
def create_organisation_user(
    payload: OrganisationUserCreatePayload,
    current=Depends(requires_role(Role.admin, Role.school)),
    session: Session = Depends(get_session),
):
    if not current.tenant_id:
        raise HTTPException(status_code=400, detail='Current organisation is not configured')
    if payload.role not in ORG_MANAGED_ROLES:
        raise HTTPException(status_code=400, detail='Role is not allowed for organisation user creation')

    resolved_school_id = payload.school_id or current.school_id
    if current.school_id and resolved_school_id and resolved_school_id != current.school_id:
        raise HTTPException(status_code=403, detail='Not allowed to create users for another school')

    if resolved_school_id:
        school = session.get(School, resolved_school_id)
        if not school or school.tenant_id != current.tenant_id:
            raise HTTPException(status_code=404, detail='School not found in your organisation')
    classroom = None
    if payload.classroom_id:
        classroom = _get_classroom_or_404(session, payload.classroom_id)
        if classroom.school_id != resolved_school_id:
            raise HTTPException(status_code=400, detail='Classroom does not belong to the selected school')

    if payload.username:
        username = payload.username.strip()
        if len(username) < 3:
            raise HTTPException(status_code=400, detail='Username must be at least 3 characters')
        existing = session.exec(select(User).where(User.username == username)).first()
        if existing:
            raise HTTPException(status_code=400, detail='Username already exists')
    else:
        username_seed = payload.full_name or payload.role.value
        username = _build_unique_username(session, username_seed)

    generated_password = None
    if payload.password:
        if len(payload.password) < 6:
            raise HTTPException(status_code=400, detail='Password must be at least 6 characters')
        password = payload.password
    else:
        generated_password = f"{payload.role.value}{secrets.token_hex(4)}"
        password = generated_password

    db_user = User(
        username=username,
        full_name=payload.full_name.strip(),
        email=payload.email,
        role=payload.role,
        tenant_id=current.tenant_id,
        school_id=resolved_school_id,
        hashed_password=get_password_hash(password),
        must_change_password=True,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    if payload.role == Role.student:
        existing_student = session.exec(select(Student).where(Student.user_id == db_user.id)).first()
        if not existing_student:
            student = Student(
                user_id=db_user.id,
                tenant_id=current.tenant_id,
                school_id=resolved_school_id,
                classroom_id=payload.classroom_id,
            )
            session.add(student)
            session.commit()

    return {
        'success': True,
        'user': {
            'id': db_user.id,
            'username': db_user.username,
            'full_name': db_user.full_name,
            'email': db_user.email,
            'role': db_user.role,
            'tenant_id': db_user.tenant_id,
            'school_id': db_user.school_id,
        },
        'credentials': {
            'username': db_user.username,
            'password': generated_password or 'provided-by-admin',
            'generated_password': generated_password is not None,
        }
    }


@router.get('/auth/me')
def me(current=Depends(get_current_user), session: Session = Depends(get_session)):
    # include school_id if the user has a student record
    school_id = None
    stmt = select(Student).where(Student.user_id == current.id)
    student = session.exec(stmt).first()
    if student:
        school_id = student.school_id
    return {
        'success': True,
        'id': current.id,
        'username': current.username,
        'full_name': current.full_name,
        'email': current.email,
        'role': current.role,
        'tenant_id': current.tenant_id,
        'school_id': school_id or current.school_id,
        'must_change_password': current.must_change_password,
    }


@router.get('/schools/{school_id}/activities')
def school_activities(school_id: int, current=Depends(get_current_user), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id)
    # return basic aggregated activities: students and classrooms
    students = session.exec(select(Student).where(Student.school_id == school_id)).all()
    classes = session.exec(select(ClassRoom).where(ClassRoom.school_id == school_id)).all()
    return {
        'school_id': school_id,
        'students': [{'id': s.id, 'user_id': s.user_id} for s in students],
        'classrooms': [{'id': c.id, 'name': c.name} for c in classes]
    }


# ClassRoom CRUD
@router.post('/schools/{school_id}/classrooms', response_model=ClassRoom)
def create_classroom(
    school_id: int,
    payload: ClassroomCreatePayload,
    current=Depends(requires_role(Role.admin, Role.school)),
    session: Session = Depends(get_session),
):
    ensure_school_access(current, school_id)
    school = _get_school_or_404(session, school_id)
    classroom = ClassRoom(
        name=payload.name.strip(),
        school_id=school_id,
        tenant_id=school.tenant_id or current.tenant_id,
    )
    session.add(classroom)
    session.commit()
    session.refresh(classroom)
    return classroom


@router.get('/schools/{school_id}/classrooms', response_model=list[ClassroomSummary])
def list_classrooms(school_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id)
    classrooms = session.exec(select(ClassRoom).where(ClassRoom.school_id == school_id)).all()
    students = session.exec(select(Student).where(Student.school_id == school_id)).all()
    teachers = session.exec(select(User).where(User.role == Role.teacher, User.school_id == school_id)).all()
    teacher_map = {teacher.id: teacher for teacher in teachers}
    student_counts = {}
    for student in students:
        if student.classroom_id:
            student_counts[student.classroom_id] = student_counts.get(student.classroom_id, 0) + 1

    summaries = []
    for classroom in classrooms:
        teacher = teacher_map.get(classroom.class_teacher_user_id) if classroom.class_teacher_user_id else None
        summaries.append(
            ClassroomSummary(
                id=classroom.id,
                name=classroom.name,
                tenant_id=classroom.tenant_id,
                school_id=classroom.school_id,
                class_teacher_user_id=classroom.class_teacher_user_id,
                class_teacher_name=(teacher.full_name or teacher.username) if teacher else None,
                student_count=student_counts.get(classroom.id, 0),
            )
        )
    return summaries


@router.get('/classrooms/{class_id}', response_model=ClassroomDetails)
def get_classroom(class_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher, Role.student, Role.parent)), session: Session = Depends(get_session)):
    cls = _get_classroom_or_404(session, class_id)
    ensure_school_access(current, cls.school_id)
    teacher = session.get(User, cls.class_teacher_user_id) if cls.class_teacher_user_id else None
    students = session.exec(select(Student).where(Student.classroom_id == cls.id)).all()
    return ClassroomDetails(
        id=cls.id,
        name=cls.name,
        tenant_id=cls.tenant_id,
        school_id=cls.school_id,
        class_teacher_user_id=cls.class_teacher_user_id,
        class_teacher_name=(teacher.full_name or teacher.username) if teacher else None,
        student_count=len(students),
        students=[_serialize_student(session, student) for student in students],
    )


@router.put('/classrooms/{class_id}', response_model=ClassRoom)
def update_classroom(class_id: int, payload: ClassroomUpdatePayload, current=Depends(requires_role(Role.admin, Role.school)), session: Session = Depends(get_session)):
    cls = _get_classroom_or_404(session, class_id)
    ensure_school_access(current, cls.school_id)
    if payload.name is not None and payload.name.strip():
        cls.name = payload.name.strip()
    if payload.class_teacher_user_id is not None:
        teacher = session.get(User, payload.class_teacher_user_id)
        if not teacher or teacher.role != Role.teacher or teacher.school_id != cls.school_id:
            raise HTTPException(status_code=400, detail='Selected teacher is not available for this classroom')
        existing_class = session.exec(
            select(ClassRoom).where(
                ClassRoom.class_teacher_user_id == payload.class_teacher_user_id,
                ClassRoom.id != cls.id,
            )
        ).first()
        if existing_class:
            raise HTTPException(status_code=400, detail='Teacher is already assigned as class teacher to another classroom')
        cls.class_teacher_user_id = payload.class_teacher_user_id
    session.add(cls)
    session.commit()
    session.refresh(cls)
    return cls


@router.delete('/classrooms/{class_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_classroom(class_id: int, current=Depends(requires_role(Role.admin, Role.school)), session: Session = Depends(get_session)):
    cls = _get_classroom_or_404(session, class_id)
    ensure_school_access(current, cls.school_id)
    students = session.exec(select(Student).where(Student.classroom_id == cls.id)).all()
    for student in students:
        student.classroom_id = None
        session.add(student)
    session.delete(cls)
    session.commit()
    return {}


# Students endpoints
@router.get('/schools/{school_id}/students')
def list_students(school_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id)
    students = session.exec(select(Student).where(Student.school_id == school_id)).all()
    return [_serialize_student(session, student) for student in students]


@router.post('/schools/{school_id}/students')
def create_student(
    school_id: int,
    payload: StudentCreatePayload,
    current=Depends(requires_role(Role.admin, Role.school)),
    session: Session = Depends(get_session),
):
    ensure_school_access(current, school_id)
    school = _get_school_or_404(session, school_id)

    uid = payload.user_id
    if not uid and payload.username:
        user = session.exec(select(User).where(User.username == payload.username.strip())).first()
        if user:
            uid = user.id
    if not uid:
        raise HTTPException(status_code=400, detail='Provide a valid username or user_id')

    user = session.get(User, uid)
    if not user or user.school_id != school_id or user.tenant_id != school.tenant_id:
        raise HTTPException(status_code=404, detail='Selected user is not part of this school')
    if user.role != Role.student:
        raise HTTPException(status_code=400, detail='Selected user is not a student')

    existing = session.exec(select(Student).where(Student.user_id == uid)).first()
    if existing:
        raise HTTPException(status_code=400, detail='Student is already linked')

    classroom_id = payload.classroom_id
    if classroom_id:
        classroom = _get_classroom_or_404(session, classroom_id)
        if classroom.school_id != school_id:
            raise HTTPException(status_code=400, detail='Classroom does not belong to this school')

    student = Student(
        user_id=uid,
        school_id=school_id,
        tenant_id=school.tenant_id or current.tenant_id,
        classroom_id=classroom_id,
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return _serialize_student(session, student)


@router.delete('/students/{student_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, current=Depends(requires_role(Role.admin, Role.school)), session: Session = Depends(get_session)):
    s = session.get(Student, student_id)
    if not s:
        raise HTTPException(status_code=404, detail='Student not found')
    ensure_school_access(current, s.school_id)
    session.delete(s)
    session.commit()
    return {}


# Teachers endpoints (users with role=teacher)
@router.post('/schools/{school_id}/teachers')
def create_teacher(
    school_id: int,
    payload: TeacherCreatePayload,
    current=Depends(requires_role(Role.admin, Role.school)),
    session: Session = Depends(get_session),
):
    ensure_school_access(current, school_id)
    statement = select(User).where(User.username == payload.username)
    exists = session.exec(statement).first()
    if exists:
        raise HTTPException(status_code=400, detail='Username already exists')

    school = _get_school_or_404(session, school_id)
    classroom = None
    if payload.classroom_id:
        classroom = _get_classroom_or_404(session, payload.classroom_id)
        if classroom.school_id != school_id:
            raise HTTPException(status_code=400, detail='Classroom does not belong to this school')
        if classroom.class_teacher_user_id:
            raise HTTPException(status_code=400, detail='Classroom already has a class teacher')

    hashed = get_password_hash(payload.password)
    db_user = User(
        username=payload.username,
        full_name=payload.full_name or payload.username,
        email=payload.email,
        role=Role.teacher,
        school_id=school_id,
        tenant_id=school.tenant_id or current.tenant_id,
        hashed_password=hashed,
        must_change_password=True,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    if classroom:
        classroom.class_teacher_user_id = db_user.id
        session.add(classroom)
        session.commit()
        session.refresh(classroom)

    return _serialize_teacher(db_user, classroom)


@router.get('/schools/{school_id}/teachers')
def list_teachers(school_id: int, current=Depends(requires_role(Role.superadmin, Role.admin, Role.school, Role.teacher)), session: Session = Depends(get_session)):
    ensure_school_access(current, school_id)
    teachers = session.exec(select(User).where(User.role == Role.teacher, User.school_id == school_id)).all()
    classrooms = session.exec(select(ClassRoom).where(ClassRoom.school_id == school_id)).all()
    classroom_by_teacher = {classroom.class_teacher_user_id: classroom for classroom in classrooms if classroom.class_teacher_user_id}
    return [_serialize_teacher(teacher, classroom_by_teacher.get(teacher.id)) for teacher in teachers]


@router.delete('/teachers/{teacher_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(teacher_id: int, current=Depends(requires_role(Role.admin, Role.school)), session: Session = Depends(get_session)):
    teacher = session.get(User, teacher_id)
    if not teacher or teacher.role != Role.teacher:
        raise HTTPException(status_code=404, detail='Teacher not found')
    ensure_school_access(current, teacher.school_id)
    classrooms = session.exec(select(ClassRoom).where(ClassRoom.class_teacher_user_id == teacher.id)).all()
    for classroom in classrooms:
        classroom.class_teacher_user_id = None
        session.add(classroom)
    session.delete(teacher)
    session.commit()
    return {}
