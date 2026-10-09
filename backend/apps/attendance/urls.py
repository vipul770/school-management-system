from rest_framework.routers import SimpleRouter
from django.urls import path
from core.api import model_viewset
from .models import StudentAttendance, TeacherAttendance
from .views import AttendanceReportsView, AttendanceSessionViewSet
from .serializers import StudentAttendanceSerializer, TeacherAttendanceSerializer

router = SimpleRouter()
router.register("attendance/sessions", AttendanceSessionViewSet, basename="attendance-sessions")
router.register("attendance/records", model_viewset(StudentAttendance, "attendance.view", StudentAttendanceSerializer), basename="attendance-records")
router.register("attendance/teacher-records", model_viewset(TeacherAttendance, "attendance.view", TeacherAttendanceSerializer), basename="teacher-attendance")
urlpatterns = [path("attendance/reports/", AttendanceReportsView.as_view(), name="attendance-reports"),
    path("attendance/reports/class/<uuid:class_id>/", AttendanceReportsView.as_view(), name="class-attendance-report")] + router.urls
