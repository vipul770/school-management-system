from django.db import transaction
from django.db.models import Count
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from core.api import TenantModelViewSet
from core.permissions import HasPermission
from .models import AttendanceSession, StudentAttendance
from apps.notifications.tasks import send_attendance_alerts
from apps.students.models import Student
from apps.students.models import Enrollment
from core.tasks import dispatch_task
from .serializers import AttendanceSessionSerializer

class AttendanceSessionViewSet(TenantModelViewSet):
    queryset = AttendanceSession.all_objects.all()
    serializer_class = AttendanceSessionSerializer
    required_permission = "attendance.view"

    def perform_create(self, serializer):
        super().perform_create(serializer)
        session = serializer.instance
        students = Enrollment.objects.filter(school_id=session.school_id, class_section=session.class_section, status="active").values_list("student_id", flat=True)
        StudentAttendance.objects.bulk_create([StudentAttendance(school_id=session.school_id, session=session, student_id=student_id, status="present") for student_id in students], ignore_conflicts=True)

    @action(detail=True, methods=("get",), url_path="students")
    def students(self, request, pk=None):
        session = self.get_object()
        records = session.student_attendances.select_related("student")
        return Response([{"id": r.id, "student_id": r.student_id, "admission_number": r.student.admission_number,
                          "name": f"{r.student.first_name} {r.student.last_name}", "status": r.status, "remarks": r.remarks} for r in records])

    @action(detail=True, methods=("post",), url_path="submit")
    def submit(self, request, pk=None):
        session = self.get_object()
        records = request.data.get("records", [])
        if not isinstance(records, list) or not records:
            raise ValidationError({"records": "Submit a non-empty list of student attendance records."})
        allowed = {value for value, _ in StudentAttendance._meta.get_field("status").choices}
        with transaction.atomic():
            for item in records:
                if item.get("status") not in allowed:
                    raise ValidationError({"status": "Status must be present, absent, late, or excused."})
                try:
                    student_id = item["student_id"]
                    Student.objects.get(pk=student_id, school_id=request.user.school_id)
                except (KeyError, Student.DoesNotExist):
                    raise ValidationError({"student_id": "Student not found in this school."})
                StudentAttendance.objects.update_or_create(school_id=request.user.school_id, session=session, student_id=student_id,
                    defaults={"status": item["status"], "remarks": item.get("remarks", "")})
            session.status = "submitted"
            session.save(update_fields=("status", "updated_at"))
        dispatch_task(send_attendance_alerts, str(session.pk))
        return Response({"status": "submitted", "record_count": len(records)})

class AttendanceReportsView(APIView):
    permission_classes = (permissions.IsAuthenticated, HasPermission)
    required_permission = "attendance.view"

    def get(self, request, class_id=None):
        if request.user.role not in ("school_admin", "teacher"):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Attendance reports are available to school administrators and teachers.")
        records = StudentAttendance.all_objects.filter(school_id=request.user.school_id)
        if class_id:
            records = records.filter(session__class_section_id=class_id)
        if request.user.role == "teacher":
            records = records.filter(session__class_section__teacher_assignments__teacher__user=request.user).distinct()
        if start := request.query_params.get("from"):
            records = records.filter(session__date__gte=start)
        if end := request.query_params.get("to"):
            records = records.filter(session__date__lte=end)
        counts = {state: records.filter(status=state).count() for state, _ in StudentAttendance._meta.get_field("status").choices}
        total = sum(counts.values())
        sessions = records.values("session__date", "session__class_section__name").annotate(total=Count("id")).order_by("-session__date")[:100]
        return Response({"total": total, "counts": counts, "attendance_rate": round(100 * (counts.get("present", 0) + counts.get("late", 0)) / total) if total else 0,
                         "classes": list(sessions)})
