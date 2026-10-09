from django.db.models import Count
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from core.api import TenantModelViewSet
from .models import Student
from apps.attendance.models import StudentAttendance
from apps.fees.models import StudentFeeAccount
from apps.exams.models import ExamResult
from .tasks import import_students_csv
from .serializers import StudentSerializer
from core.tasks import dispatch_task
from core.plans import enforce_plan_limit
from apps.accounts.models import User
from core.tasks import dispatch_task as dispatch_background
from apps.accounts.tasks import send_welcome_email

class StudentViewSet(TenantModelViewSet):
    queryset = Student.all_objects.all()
    serializer_class = StudentSerializer
    required_permission = "students.view"
    # Student profiles are normally posted as JSON; CSV imports remain multipart.
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=("is_active", "updated_at"))

    def perform_create(self, serializer):
        if self.request.user.school_id:
            enforce_plan_limit(self.request.user.school, "students")
        school_id = self.request.user.school_id or self.request.data.get("school") or self.request.query_params.get("school_id")
        from apps.schools.models import School
        school = School.objects.get(pk=school_id)
        email = serializer.validated_data.get("email")
        account = None
        if email:
            if User.objects.filter(email__iexact=email).exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"email": "An account already uses this email address."})
            import secrets
            account = User.objects.create_user(username=f"student_{school.pk.hex[:8]}_{secrets.token_hex(5)}", email=email,
                password=secrets.token_urlsafe(24), first_name=serializer.validated_data.get("first_name", ""),
                last_name=serializer.validated_data.get("last_name", ""), school=school, role=User.Role.STUDENT)
        super().perform_create(serializer)
        if account:
            serializer.instance.user = account
            serializer.instance.save(update_fields=("user", "updated_at"))
            dispatch_background(send_welcome_email, account.pk)

    @action(detail=True, methods=("get",), url_path="attendance-summary")
    def attendance_summary(self, request, pk=None):
        student = self.get_object()
        rows = StudentAttendance.objects.filter(school_id=request.user.school_id, student=student).values("status").annotate(total=Count("id"))
        counts = {row["status"]: row["total"] for row in rows}
        total = sum(counts.values())
        return Response({"counts": counts, "total": total, "attendance_rate": round(100 * counts.get("present", 0) / total) if total else 0})

    @action(detail=True, methods=("get",), url_path="fee-account")
    def fee_account(self, request, pk=None):
        student = self.get_object()
        rows = StudentFeeAccount.objects.filter(school_id=request.user.school_id, student=student)
        return Response([{"id": row.pk, "academic_year": row.academic_year, "total_due": row.total_due, "total_paid": row.total_paid, "balance": row.balance} for row in rows])

    @action(detail=True, methods=("get",), url_path="results")
    def results(self, request, pk=None):
        student = self.get_object()
        results = ExamResult.objects.filter(school_id=request.user.school_id, student=student).select_related("exam", "subject")
        return Response([{"id": row.pk, "exam": row.exam.name, "subject": row.subject.name, "marks_obtained": row.marks_obtained, "max_marks": row.max_marks, "grade": row.grade, "remarks": row.remarks} for row in results])

    @action(detail=False, methods=("post",), url_path="bulk-import")
    def bulk_import(self, request):
        upload = request.FILES.get("file")
        if not upload or not upload.name.lower().endswith(".csv"):
            raise ValidationError({"file": "Upload a CSV file."})
        import uuid
        from django.core.files.storage import default_storage
        upload.seek(0)
        storage_path = default_storage.save(f"imports/{request.user.school_id}/{uuid.uuid4()}.csv", upload)
        task = dispatch_task(import_students_csv, str(request.user.school_id), storage_path)
        completed = getattr(task, "successful", lambda: False)()
        return Response({"task_id": getattr(task, "id", None), "status": "completed" if completed else "queued", "result": getattr(task, "result", None) if completed else None}, status=202)
