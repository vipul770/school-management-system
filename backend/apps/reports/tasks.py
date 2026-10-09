from celery import shared_task
from .models import ReportJob

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="bulk")
def generate_report(self, report_id):
    job = ReportJob.all_objects.get(pk=report_id)
    from apps.students.models import Student
    from apps.teachers.models import Teacher
    from apps.classes.models import Classroom
    from apps.attendance.models import StudentAttendance
    from apps.fees.models import FeeTransaction
    from django.db.models import Sum
    job.result_data = {
        "students": Student.all_objects.filter(school_id=job.school_id, is_active=True).count(),
        "teachers": Teacher.all_objects.filter(school_id=job.school_id).count(),
        "classes": Classroom.all_objects.filter(school_id=job.school_id).count(),
        "attendance_records": StudentAttendance.all_objects.filter(school_id=job.school_id).count(),
        "fees_collected": str(FeeTransaction.all_objects.filter(school_id=job.school_id).aggregate(total=Sum("amount"))["total"] or 0),
    }
    try:
        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage
        from utils.pdf import render_pdf
        pdf = render_pdf("reports/summary.html", {"job": job, "data": job.result_data})
        path = default_storage.save(f"reports/{job.school_id}/{job.pk}.pdf", ContentFile(pdf))
        job.result_url = default_storage.url(path)
    except RuntimeError:
        pass
    job.status = "completed"
    job.save(update_fields=("result_data", "result_url", "status", "updated_at"))
    return {"report_id": str(job.pk), "status": job.status}

@shared_task
def generate_monthly_reports():
    from django.utils import timezone
    from apps.schools.models import School
    count = 0
    for school in School.objects.filter(is_active=True):
        job = ReportJob.all_objects.create(school=school, report_type="monthly_school_summary", status="queued", parameters={"month": timezone.localdate().strftime("%Y-%m")})
        generate_report.delay(str(job.pk))
        count += 1
    return {"created": count}
