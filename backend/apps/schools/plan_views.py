from rest_framework import permissions, serializers, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from django.db import transaction
from core.permissions import HasPermission
from core.models import AuditLog
from .models import School, SchoolSubscription, SubscriptionPlan

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (permissions.IsAuthenticated, HasPermission)
    required_permission = "schools.view"

    def get_queryset(self):
        qs = super().get_queryset()
        return qs if self.request.user.role == "super_admin" else qs.filter(is_active=True)

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy") and getattr(self.request.user, "role", None) != "super_admin":
            raise PermissionDenied("Only platform administrators can manage subscription plans.")
        return super().get_permissions()

    @transaction.atomic
    def perform_create(self, serializer):
        plan = serializer.save()
        AuditLog.objects.create(actor=self.request.user, action="CREATE", model_name="SubscriptionPlan",
                                object_id=str(plan.pk), after_state={"name": plan.name, "is_active": plan.is_active})

    @transaction.atomic
    def perform_update(self, serializer):
        before = self.get_serializer(serializer.instance).data
        plan = serializer.save()
        AuditLog.objects.create(actor=self.request.user, action="UPDATE", model_name="SubscriptionPlan",
                                object_id=str(plan.pk), before_state=before,
                                after_state={"name": plan.name, "is_active": plan.is_active})

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=("is_active", "updated_at"))
        AuditLog.objects.create(actor=self.request.user, action="UPDATE", model_name="SubscriptionPlan",
                                object_id=str(instance.pk), after_state={"name": instance.name, "is_active": False})


class SchoolSubscriptionSerializer(serializers.ModelSerializer):
    school = serializers.PrimaryKeyRelatedField(queryset=School.objects.all())
    school_name = serializers.CharField(source="school.name", read_only=True)
    organization_id = serializers.CharField(source="school.organization_id", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)

    class Meta:
        model = SchoolSubscription
        fields = ("id", "school", "school_name", "organization_id", "plan", "plan_name", "status", "start_date", "end_date", "stripe_subscription_id", "created_at", "updated_at")
        read_only_fields = ("id", "school_name", "organization_id", "plan_name", "stripe_subscription_id", "created_at", "updated_at")

    def validate_status(self, value):
        if value not in ("active", "trialing", "past_due", "canceled", "expired", "suspended"):
            raise serializers.ValidationError("Choose a supported subscription status.")
        return value


class PlatformSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = SchoolSubscription.objects.select_related("school", "plan").all()
    serializer_class = SchoolSubscriptionSerializer
    permission_classes = (permissions.IsAuthenticated, HasPermission)
    required_permission = "schools.view"

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == "super_admin":
            school_id = self.request.query_params.get("school_id")
            return queryset.filter(school_id=school_id) if school_id else queryset
        return queryset.filter(school_id=self.request.user.school_id)

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy") and getattr(self.request.user, "role", None) != "super_admin":
            raise PermissionDenied("Only platform administrators can manage subscriptions.")
        return super().get_permissions()

    @transaction.atomic
    def perform_create(self, serializer):
        school = serializer.validated_data["school"]
        status_value = serializer.validated_data.get("status", "active")
        if status_value in ("active", "trialing"):
            SchoolSubscription.objects.filter(school=school, status__in=("active", "trialing")).update(status="canceled", end_date=timezone.localdate())
        subscription = serializer.save()
        AuditLog.objects.create(school=school, actor=self.request.user, action="CREATE", model_name="SchoolSubscription",
                                object_id=str(subscription.pk), after_state={"plan": subscription.plan.name, "status": subscription.status})

    @transaction.atomic
    def perform_update(self, serializer):
        before = self.get_serializer(serializer.instance).data
        subscription = serializer.save()
        if subscription.status in ("active", "trialing"):
            SchoolSubscription.objects.filter(school=subscription.school, status__in=("active", "trialing")).exclude(pk=subscription.pk).update(status="canceled", end_date=timezone.localdate())
        AuditLog.objects.create(school=subscription.school, actor=self.request.user, action="UPDATE", model_name="SchoolSubscription",
                                object_id=str(subscription.pk), before_state=before,
                                after_state={"plan": subscription.plan.name, "status": subscription.status})
