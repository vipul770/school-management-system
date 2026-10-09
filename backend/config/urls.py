from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.core.paginator import Paginator
from django.utils import timezone
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.classes.models import Classroom
from apps.fees.models import FeeTransaction, StudentFeeAccount
from apps.attendance.models import AttendanceSession, StudentAttendance
from apps.students.models import Enrollment
from apps.exams.models import Exam, ExamResult, ExamTimetable
from apps.assignments.models import Assignment
from apps.notifications.models import Notification
from apps.schools.views import SchoolOnboardingView
from apps.schools.models import School, SchoolSubscription, SubscriptionPlan
from apps.schools.billing_views import CreateCheckoutSessionView, StripeWebhookView
from core.models import AuditLog
from rest_framework.exceptions import PermissionDenied
from apps.accounts.models import User

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    school_id = request.user.school_id
    if not school_id:
        return Response({"students": 0, "teachers": 0, "classes": 0, "attendance_rate": 0, "fee_collected_month": 0, "pending_dues": 0})
    if request.user.role in ("student", "parent"):
        profile_filter = {"user": request.user} if request.user.role == "student" else {"guardian_user": request.user}
        profiles = Student.objects.filter(school_id=school_id, **profile_filter)
        student_ids = list(profiles.values_list("pk", flat=True))
        records = StudentAttendance.objects.filter(school_id=school_id, student_id__in=student_ids)
        total = records.count()
        present = records.filter(status__in=("present", "late")).count()
        dues = StudentFeeAccount.objects.filter(school_id=school_id, student_id__in=student_ids)
        due_total = sum((account.balance for account in dues), start=0)
        return Response({"students": len(student_ids), "teachers": 0, "classes": Enrollment.objects.filter(school_id=school_id, student_id__in=student_ids, status="active").values("class_section_id").distinct().count(),
            "attendance_rate": round(100 * present / total) if total else 0, "fee_collected_month": 0, "pending_dues": due_total,
            "upcoming_exams": ExamTimetable.objects.filter(school_id=school_id, class_section__enrollments__student_id__in=student_ids, date__gte=timezone.localdate()).count(),
            "upcoming_assignments": Assignment.objects.filter(school_id=school_id, class_section__enrollments__student_id__in=student_ids, due_at__gte=timezone.now()).count(),
            "unread_notifications": Notification.objects.filter(school_id=school_id, recipient=request.user, read_at__isnull=True).count()})
    if request.user.role == "teacher":
        from apps.teachers.models import Teacher
        teacher = Teacher.objects.filter(school_id=school_id, user=request.user).first()
        class_count = teacher.assignments.filter(school_id=school_id).values("class_section_id").distinct().count() if teacher else 0
        return Response({"students": Student.objects.filter(school_id=school_id, enrollments__class_section__teacher_assignments__teacher=teacher).distinct().count() if teacher else 0,
            "teachers": 1 if teacher else 0, "classes": class_count, "attendance_rate": 0, "fee_collected_month": 0, "pending_dues": 0,
            "upcoming_assignments": Assignment.objects.filter(school_id=school_id, teacher=teacher, due_at__gte=timezone.now()).count() if teacher else 0,
            "unread_notifications": Notification.objects.filter(school_id=school_id, recipient=request.user, read_at__isnull=True).count()})
    month = timezone.localdate().replace(day=1)
    records = StudentAttendance.objects.filter(school_id=school_id, session__date=timezone.localdate())
    count = records.count()
    present = records.filter(status__in=("present", "late")).count()
    return Response({
        "students": Student.objects.filter(school_id=school_id, is_active=True).count(),
        "teachers": Teacher.objects.filter(school_id=school_id).count(),
        "classes": Classroom.objects.filter(school_id=school_id).count(),
        "attendance_rate": round(present * 100 / count) if count else 0,
        "fee_collected_month": FeeTransaction.objects.filter(school_id=school_id, paid_at__date__gte=month).aggregate(v=Sum("amount"))["v"] or 0,
        "pending_dues": sum((account.balance for account in StudentFeeAccount.objects.filter(school_id=school_id)), start=0),
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def audit_logs(request):
    if request.user.role not in ("school_admin", "super_admin"):
        raise PermissionDenied("Only school and platform administrators can view audit logs.")
    records = AuditLog.objects.select_related("school", "actor")
    if request.user.role == "super_admin":
        if school_id := request.query_params.get("school_id"):
            records = records.filter(school_id=school_id)
    else:
        records = records.filter(school_id=request.user.school_id)
    if model_name := request.query_params.get("model"):
        records = records.filter(model_name__icontains=model_name)
    if action := request.query_params.get("action"):
        records = records.filter(action__iexact=action)
    if start := request.query_params.get("date_from"):
        records = records.filter(created_at__date__gte=start)
    if end := request.query_params.get("date_to"):
        records = records.filter(created_at__date__lte=end)
    if search := request.query_params.get("search"):
        records = records.filter(Q(model_name__icontains=search) | Q(object_id__icontains=search) |
                                Q(actor__email__icontains=search) | Q(school__name__icontains=search) |
                                Q(school__organization_id__icontains=search) | Q(action__icontains=search))
    try:
        page_size = int(request.query_params.get("page_size", 25))
    except (TypeError, ValueError):
        page_size = 25
    paginator = Paginator(records, min(max(page_size, 1), 100))
    page = paginator.get_page(request.query_params.get("page", 1))
    return Response({"count": paginator.count, "page": page.number, "page_size": paginator.per_page,
        "total_pages": paginator.num_pages, "results": [{"id": row.id, "school_id": row.school_id,
        "school_name": row.school.name if row.school_id else None,
        "organization_id": row.school.organization_id if row.school_id else None,
        "actor_id": row.actor_id, "actor_email": row.actor.email if row.actor_id else None,
        "action": row.action, "model": row.model_name, "object_id": row.object_id,
        "before": row.before_state, "after": row.after_state, "ip_address": row.ip_address,
        "created_at": row.created_at} for row in page.object_list]})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def platform_summary(request):
    if request.user.role != "super_admin":
        raise PermissionDenied("Only platform administrators can view platform metrics.")
    active_subscriptions = SchoolSubscription.objects.filter(status__in=("active", "trialing"))
    latest_schools = School.objects.order_by("-created_at")[:8]
    role_counts = dict(User.objects.values_list("role").annotate(total=Count("id")))
    revenue = active_subscriptions.aggregate(total=Sum("plan__price_monthly"))["total"] or 0
    return Response({
        "schools": {"total": School.objects.count(), "active": School.objects.filter(is_active=True).count(), "inactive": School.objects.filter(is_active=False).count()},
        "users": {"total": User.objects.count(), "active": User.objects.filter(is_active=True).count(), "by_role": role_counts},
        "students": Student.all_objects.count(), "teachers": Teacher.all_objects.count(),
        "subscriptions": {"total": SchoolSubscription.objects.count(), "active": active_subscriptions.count(),
            "past_due": SchoolSubscription.objects.filter(status="past_due").count(),
            "canceled": SchoolSubscription.objects.filter(status="canceled").count(), "monthly_revenue": revenue},
        "plans": {"total": SubscriptionPlan.objects.count(), "active": SubscriptionPlan.objects.filter(is_active=True).count()},
        "recent_schools": [{"id": item.id, "name": item.name, "organization_id": item.organization_id,
            "email": item.email, "is_active": item.is_active, "created_at": item.created_at}
            for item in latest_schools],
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", lambda request: JsonResponse({"status": "ok", "service": "sms-api"})),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/accounts/", include("apps.accounts.users_urls")),
    path("api/v1/onboarding/school/", SchoolOnboardingView.as_view(), name="school-onboarding"),
    path("api/v1/billing/webhook/", StripeWebhookView.as_view(), name="billing-webhook"),
    path("api/v1/billing/checkout/", CreateCheckoutSessionView.as_view(), name="billing-checkout"),
    path("api/v1/dashboard/summary/", dashboard_summary),
    path("api/v1/platform/summary/", platform_summary),
    path("api/v1/audit-logs/", audit_logs),
    path("api/v1/", include("apps.schools.urls")),
    path("api/v1/", include("apps.students.urls")),
    path("api/v1/", include("apps.teachers.urls")),
    path("api/v1/", include("apps.classes.urls")),
    path("api/v1/", include("apps.attendance.urls")),
    path("api/v1/", include("apps.fees.urls")),
    path("api/v1/", include("apps.exams.urls")),
    path("api/v1/", include("apps.assignments.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    path("api/v1/", include("apps.reports.urls")),
    path("api/v1/", include("apps.communications.urls")),
]
