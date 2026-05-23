from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import csv
import io
import zipfile
from .db import get_db_session
from .models import User, Tenant, School, Student, ClassRoom
from .auth import get_current_user
from .tenant_context import get_tenant_context
from pydantic import BaseModel

router = APIRouter()


# Backup Schemas
class BackupRequest(BaseModel):
    include_users: bool = True
    include_students: bool = True
    include_schools: bool = True
    include_classes: bool = True
    format: str = "json"  # json, csv, xlsx


class BackupResponse(BaseModel):
    backup_id: str
    status: str
    created_at: str
    download_url: Optional[str] = None
    file_size: Optional[int] = None


class ExportRequest(BaseModel):
    entity_type: str  # users, students, schools, classes
    format: str = "csv"  # csv, xlsx, json
    filters: Optional[Dict[str, Any]] = None


class BackupJob(BaseModel):
    id: str
    tenant_id: int
    status: str  # pending, processing, completed, failed
    created_at: str
    completed_at: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    error_message: Optional[str] = None


# In-memory storage for backup jobs (in production, use database)
backup_jobs: Dict[str, BackupJob] = {}


def generate_backup_id() -> str:
    """Generate unique backup ID"""
    import uuid
    return str(uuid.uuid4())


@router.post("/backup/create", response_model=BackupResponse)
def create_backup(
    backup_request: BackupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Create a backup of tenant data"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    backup_id = generate_backup_id()
    
    # Create backup job
    backup_job = BackupJob(
        id=backup_id,
        tenant_id=current_user.tenant_id,
        status="pending",
        created_at=datetime.utcnow().isoformat()
    )
    
    backup_jobs[backup_id] = backup_job
    
    # Start background backup process
    background_tasks.add_task(
        process_backup,
        backup_id,
        current_user.tenant_id,
        backup_request.dict(),
        db
    )
    
    return BackupResponse(
        backup_id=backup_id,
        status="pending",
        created_at=backup_job.created_at
    )


async def process_backup(
    backup_id: str,
    tenant_id: int,
    backup_config: dict,
    db: Session
):
    """Process backup in background"""
    try:
        backup_job = backup_jobs[backup_id]
        backup_job.status = "processing"
        
        # Collect data
        backup_data = {}
        
        if backup_config.get("include_users"):
            users = db.exec(
                select(User).where(User.tenant_id == tenant_id)
            ).all()
            backup_data["users"] = [
                {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                    "school_id": user.school_id,
                    "created_at": getattr(user, 'created_at', None)
                }
                for user in users
            ]
        
        if backup_config.get("include_students"):
            students = db.exec(
                select(Student).where(Student.tenant_id == tenant_id)
            ).all()
            backup_data["students"] = [
                {
                    "id": student.id,
                    "full_name": student.full_name,
                    "email": student.email,
                    "roll_number": getattr(student, 'roll_number', None),
                    "class_id": getattr(student, 'class_id', None),
                    "school_id": getattr(student, 'school_id', None)
                }
                for student in students
            ]
        
        if backup_config.get("include_schools"):
            schools = db.exec(
                select(School).where(School.tenant_id == tenant_id)
            ).all()
            backup_data["schools"] = [
                {
                    "id": school.id,
                    "name": school.name,
                    "address": school.address,
                    "contact_email": getattr(school, 'contact_email', None)
                }
                for school in schools
            ]
        
        if backup_config.get("include_classes"):
            classes = db.exec(
                select(ClassRoom).where(ClassRoom.tenant_id == tenant_id)
            ).all()
            backup_data["classes"] = [
                {
                    "id": classroom.id,
                    "name": classroom.name,
                    "school_id": classroom.school_id
                }
                for classroom in classes
            ]
        
        # Generate file based on format
        format = backup_config.get("format", "json")
        file_path = f"/tmp/backup_{backup_id}.{format}"
        
        if format == "json":
            with open(file_path, 'w') as f:
                json.dump(backup_data, f, indent=2, default=str)
        elif format == "csv":
            # Create ZIP with multiple CSV files
            with zipfile.ZipFile(file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for entity_name, data in backup_data.items():
                    if data:
                        csv_buffer = io.StringIO()
                        if data:
                            writer = csv.DictWriter(csv_buffer, fieldnames=data[0].keys())
                            writer.writeheader()
                            writer.writerows(data)
                        
                        zipf.writestr(f"{entity_name}.csv", csv_buffer.getvalue())
        
        # Get file size
        import os
        file_size = os.path.getsize(file_path)
        
        # Update backup job
        backup_job.status = "completed"
        backup_job.completed_at = datetime.utcnow().isoformat()
        backup_job.file_path = file_path
        backup_job.file_size = file_size
        
    except Exception as e:
        backup_job.status = "failed"
        backup_job.error_message = str(e)
        backup_job.completed_at = datetime.utcnow().isoformat()


@router.get("/backup/{backup_id}", response_model=BackupResponse)
def get_backup_status(
    backup_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get backup status"""
    if backup_id not in backup_jobs:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    backup_job = backup_jobs[backup_id]
    
    # Check if user owns this backup
    if backup_job.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return BackupResponse(
        backup_id=backup_id,
        status=backup_job.status,
        created_at=backup_job.created_at,
        download_url=f"/api/backup/{backup_id}/download" if backup_job.status == "completed" else None,
        file_size=backup_job.file_size
    )


@router.get("/backup/{backup_id}/download")
def download_backup(
    backup_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download backup file"""
    if backup_id not in backup_jobs:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    backup_job = backup_jobs[backup_id]
    
    # Check if user owns this backup
    if backup_job.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if backup_job.status != "completed":
        raise HTTPException(status_code=400, detail="Backup not ready for download")
    
    from fastapi.responses import FileResponse
    
    return FileResponse(
        backup_job.file_path,
        media_type='application/octet-stream',
        filename=f"backup_{backup_id}.{backup_job.file_path.split('.')[-1]}"
    )


@router.get("/backups", response_model=List[BackupResponse])
def list_backups(
    current_user: User = Depends(get_current_user)
):
    """List all backups for current tenant"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    tenant_backups = [
        BackupResponse(
            backup_id=job.id,
            status=job.status,
            created_at=job.created_at,
            download_url=f"/api/backup/{job.id}/download" if job.status == "completed" else None,
            file_size=job.file_size
        )
        for job in backup_jobs.values()
        if job.tenant_id == current_user.tenant_id
    ]
    
    return sorted(tenant_backups, key=lambda x: x.created_at, reverse=True)


@router.delete("/backup/{backup_id}")
def delete_backup(
    backup_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete backup"""
    if backup_id not in backup_jobs:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    backup_job = backup_jobs[backup_id]
    
    # Check if user owns this backup
    if backup_job.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete file if exists
    if backup_job.file_path:
        import os
        try:
            os.remove(backup_job.file_path)
        except FileNotFoundError:
            pass
    
    # Remove from memory
    del backup_jobs[backup_id]
    
    return {"message": "Backup deleted successfully"}


# Export functionality
@router.post("/export")
def export_data(
    export_request: ExportRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Export specific entity data"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    entity_type = export_request.entity_type
    format = export_request.format
    filters = export_request.filters or {}
    
    # Get data based on entity type
    data = []
    
    if entity_type == "users":
        query = select(User).where(User.tenant_id == current_user.tenant_id)
        # Apply filters
        if "role" in filters:
            query = query.where(User.role == filters["role"])
        if "school_id" in filters:
            query = query.where(User.school_id == filters["school_id"])
        
        users = db.exec(query).all()
        data = [
            {
                "ID": user.id,
                "Username": user.username,
                "Full Name": user.full_name,
                "Email": user.email,
                "Role": user.role,
                "School ID": user.school_id
            }
            for user in users
        ]
    
    elif entity_type == "students":
        query = select(Student).where(Student.tenant_id == current_user.tenant_id)
        if "class_id" in filters:
            query = query.where(Student.class_id == filters["class_id"])
        if "school_id" in filters:
            query = query.where(Student.school_id == filters["school_id"])
        
        students = db.exec(query).all()
        data = [
            {
                "ID": student.id,
                "Full Name": student.full_name,
                "Email": student.email,
                "Roll Number": getattr(student, 'roll_number', ''),
                "Class ID": getattr(student, 'class_id', ''),
                "School ID": getattr(student, 'school_id', '')
            }
            for student in students
        ]
    
    elif entity_type == "schools":
        schools = db.exec(
            select(School).where(School.tenant_id == current_user.tenant_id)
        ).all()
        data = [
            {
                "ID": school.id,
                "Name": school.name,
                "Address": school.address or '',
                "Contact Email": getattr(school, 'contact_email', '')
            }
            for school in schools
        ]
    
    elif entity_type == "classes":
        query = select(ClassRoom).where(ClassRoom.tenant_id == current_user.tenant_id)
        if "school_id" in filters:
            query = query.where(ClassRoom.school_id == filters["school_id"])
        
        classes = db.exec(query).all()
        data = [
            {
                "ID": classroom.id,
                "Name": classroom.name,
                "School ID": classroom.school_id
            }
            for classroom in classes
        ]
    
    else:
        raise HTTPException(status_code=400, detail="Invalid entity type")
    
    # Generate file based on format
    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        from fastapi.responses import Response
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={entity_type}_export.csv"}
        )
    
    elif format == "json":
        from fastapi.responses import Response
        return Response(
            content=json.dumps(data, indent=2, default=str),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={entity_type}_export.json"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")


@router.get("/export/entities")
def get_exportable_entities():
    """Get list of exportable entities"""
    entities = [
        {
            "name": "users",
            "display_name": "Users",
            "description": "All user accounts including teachers, students, and staff"
        },
        {
            "name": "students",
            "display_name": "Students",
            "description": "Student records and information"
        },
        {
            "name": "schools",
            "display_name": "Schools",
            "description": "School/branch information"
        },
        {
            "name": "classes",
            "display_name": "Classes",
            "description": "Class and classroom information"
        }
    ]
    
    return entities


# Admin backup management
@router.get("/admin/backups")
def get_all_backups_admin(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get all backups across all tenants (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all backup jobs with tenant info
    all_backups = []
    for backup_job in backup_jobs.values():
        tenant = db.get(Tenant, backup_job.tenant_id)
        all_backups.append({
            "backup_id": backup_job.id,
            "tenant_name": tenant.name if tenant else "Unknown",
            "tenant_id": backup_job.tenant_id,
            "status": backup_job.status,
            "created_at": backup_job.created_at,
            "completed_at": backup_job.completed_at,
            "file_size": backup_job.file_size,
            "error_message": backup_job.error_message
        })
    
    return sorted(all_backups, key=lambda x: x.created_at, reverse=True)


@router.post("/admin/backup/cleanup")
def cleanup_old_backups(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Clean up old completed backups (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    deleted_count = 0
    
    backup_ids_to_delete = []
    for backup_id, backup_job in backup_jobs.items():
        if (backup_job.status == "completed" and 
            backup_job.completed_at and 
            datetime.fromisoformat(backup_job.completed_at) < cutoff_date):
            backup_ids_to_delete.append(backup_id)
    
    for backup_id in backup_ids_to_delete:
        backup_job = backup_jobs[backup_id]
        
        # Delete file
        if backup_job.file_path:
            import os
            try:
                os.remove(backup_job.file_path)
            except FileNotFoundError:
                pass
        
        # Remove from memory
        del backup_jobs[backup_id]
        deleted_count += 1
    
    return {
        "message": f"Cleaned up {deleted_count} old backups",
        "deleted_count": deleted_count
    }
