import csv
import io
from datetime import date
from celery import shared_task
from django.db import transaction
from django.core.files.storage import default_storage
from .models import Student
from apps.accounts.models import User
from apps.schools.models import School
from core.plans import enforce_plan_limit

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="bulk")
def import_students_csv(self, school_id, storage_path):
    try:
        with default_storage.open(storage_path, "rb") as raw:
            reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
            columns = {column.strip().lower() for column in (reader.fieldnames or ()) if column}
            required = {"admission_number", "first_name", "last_name"}
            if not required.issubset(columns):
                raise ValueError("CSV columns must include admission_number, first_name, last_name")
            school = School.objects.get(pk=school_id)
            created = 0
            skipped = 0
            with transaction.atomic():
                for line_number, raw_row in enumerate(reader, start=2):
                    row = {(key or "").strip().lower(): (value or "").strip() for key, value in raw_row.items()}
                    admission_number = row.get("admission_number", "")
                    first_name = row.get("first_name", "")
                    last_name = row.get("last_name", "")
                    if not admission_number or not first_name or not last_name:
                        raise ValueError(f"Row {line_number}: admission_number, first_name, and last_name are required.")
                    parent = None
                    if parent_email := row.get("parent_email", ""):
                        parent = User.objects.filter(email__iexact=parent_email, school_id=school_id,
                                                     role=User.Role.PARENT, is_active=True).first()
                        if not parent:
                            raise ValueError(f"Row {line_number}: parent_email must match an active parent account in this school.")
                    birth_date = None
                    if birth_value := row.get("date_of_birth", ""):
                        try:
                            birth_date = date.fromisoformat(birth_value)
                        except ValueError as error:
                            raise ValueError(f"Row {line_number}: date_of_birth must use YYYY-MM-DD format.") from error
                    already_exists = Student.all_objects.filter(school_id=school_id, admission_number=admission_number).exists()
                    if not already_exists:
                        enforce_plan_limit(school, "students")
                    _, was_created = Student.all_objects.get_or_create(
                        school_id=school_id, admission_number=admission_number,
                        defaults={"roll_number": row.get("roll_number", ""), "first_name": first_name,
                            "last_name": last_name, "date_of_birth": birth_date, "email": row.get("email", ""),
                            "guardian_name": row.get("guardian_name", ""), "guardian_phone": row.get("guardian_phone", ""),
                            "blood_group": row.get("blood_group", ""), "guardian_user": parent},
                    )
                    if was_created:
                        created += 1
                    else:
                        skipped += 1
        return {"created": created, "skipped": skipped}
    finally:
        default_storage.delete(storage_path)
