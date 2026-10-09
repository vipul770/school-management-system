from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.models import User
from core.permissions import HasPermission
from .models import FeatureFlag, School, SchoolSettings, SchoolSubscription, SubscriptionPlan
from .serializers import SchoolOnboardingSerializer, SchoolSerializer
from core.models import AuditLog

class SchoolViewSet(viewsets.ModelViewSet):
    serializer_class = SchoolSerializer
    permission_classes = (permissions.IsAuthenticated, HasPermission)
    required_permission = "schools.view"
    queryset = School.objects.all()

    def get_queryset(self):
        if self.request.user.role == "super_admin":
            return School.objects.all()
        return School.objects.filter(pk=self.request.user.school_id)

    @transaction.atomic
    def perform_create(self, serializer):
        if self.request.user.role != "super_admin":
            raise PermissionDenied()
        admin_email = (self.request.data.get("admin_email") or "").strip().lower()
        admin_username = (self.request.data.get("admin_username") or "").strip()
        admin_password = self.request.data.get("admin_password") or ""
        if not admin_email or not admin_username or len(admin_password) < 10:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"admin": "Administrator email, username, and a password of at least 10 characters are required."})
        if User.objects.filter(email__iexact=admin_email).exists() or User.objects.filter(username__iexact=admin_username).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"admin": "That administrator email or username is already in use."})
        school = serializer.save()
        User.objects.create_user(username=admin_username, email=admin_email, password=admin_password,
                                 role=User.Role.SCHOOL_ADMIN, school=school)
        starter, _ = SubscriptionPlan.objects.get_or_create(name="Starter", defaults={
            "price_monthly": 29, "max_students": 200, "max_teachers": 20,
            "features": ["students", "teachers", "attendance", "classes"],
        })
        SchoolSettings.objects.get_or_create(school=school)
        SchoolSubscription.objects.get_or_create(school=school, status="active", defaults={
            "plan": starter, "start_date": timezone.localdate(),
        })
        FeatureFlag.objects.get_or_create(school=school, feature_key="sms_notifications", defaults={"is_enabled": False})
        AuditLog.objects.create(school=school, actor=self.request.user, action="CREATE", model_name="School",
                                object_id=str(school.pk), after_state={"name": school.name, "organization_id": school.organization_id})

    def perform_update(self, serializer):
        school = self.get_object()
        before = {"name": school.name, "organization_id": school.organization_id, "is_active": school.is_active}
        school = serializer.save()
        AuditLog.objects.create(school=school, actor=self.request.user, action="UPDATE", model_name="School",
                                object_id=str(school.pk), before_state=before,
                                after_state={"name": school.name, "organization_id": school.organization_id, "is_active": school.is_active})

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=("is_active", "updated_at"))
        AuditLog.objects.create(school=instance, actor=self.request.user, action="UPDATE", model_name="School",
                                object_id=str(instance.pk), after_state={"is_active": False, "deactivated": True})

class SchoolOnboardingView(APIView):
    permission_classes = (permissions.AllowAny,)

    @transaction.atomic
    def post(self, request):
        serializer = SchoolOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        if School.objects.filter(organization_id=values["organization_id"]).exists():
            return Response({"detail": "That organization ID is already registered."}, status=409)
        if get_user_model().objects.filter(email__iexact=values["admin_email"]).exists():
            return Response({"detail": "That administrator email is already registered."}, status=409)
        school = School.objects.create(name=values["name"], organization_id=values["organization_id"], email=values["email"])
        User.objects.create_user(username=values["admin_username"], email=values["admin_email"], password=values["admin_password"], school=school, role=User.Role.SCHOOL_ADMIN)
        starter, _ = SubscriptionPlan.objects.get_or_create(name="Starter", defaults={"price_monthly": 29, "max_students": 200, "max_teachers": 20, "features": ["students", "teachers", "attendance", "classes"]})
        SchoolSubscription.objects.create(school=school, plan=starter, status="active", start_date=timezone.localdate())
        SchoolSettings.objects.create(school=school)
        FeatureFlag.objects.create(school=school, feature_key="sms_notifications", is_enabled=False)
        return Response(SchoolSerializer(school).data, status=status.HTTP_201_CREATED)
