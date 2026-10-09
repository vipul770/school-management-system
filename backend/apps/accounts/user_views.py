from django.contrib.auth import get_user_model
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from core.permissions import HasPermission
from apps.accounts.models import User
from apps.schools.models import School
from core.models import AuditLog

class ManagedUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=10, required=False)
    school_name = serializers.CharField(source="school.name", read_only=True, allow_null=True)
    organization_id = serializers.CharField(source="school.organization_id", read_only=True, allow_null=True)
    school = serializers.PrimaryKeyRelatedField(queryset=School.objects.all(), required=False, allow_null=True)
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "school", "school_name", "organization_id", "is_active", "password")
        read_only_fields = ("id", "school_name", "organization_id")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        return User.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class UserManagementViewSet(viewsets.ModelViewSet):
    serializer_class = ManagedUserSerializer
    permission_classes = (permissions.IsAuthenticated, HasPermission)
    required_permission = "accounts.view"
    queryset = get_user_model().objects.all()

    def get_queryset(self):
        if self.request.user.role == "super_admin":
            queryset = User.objects.all()
            if school_id := self.request.query_params.get("school_id"):
                queryset = queryset.filter(school_id=school_id)
        else:
            queryset = User.objects.filter(school_id=self.request.user.school_id)
        if role := self.request.query_params.get("role"):
            queryset = queryset.filter(role=role)
        if self.request.query_params.get("is_active") in ("true", "false"):
            queryset = queryset.filter(is_active=self.request.query_params["is_active"] == "true")
        return queryset.order_by("first_name", "last_name", "email")

    def get_permissions(self):
        permissions_list = super().get_permissions()
        if self.action in ("create", "update", "partial_update", "destroy") and self.request.user.role not in ("school_admin", "super_admin"):
            raise PermissionDenied("Only administrators can manage user accounts.")
        return permissions_list

    def perform_create(self, serializer):
        role = serializer.validated_data.get("role", User.Role.TEACHER)
        school = serializer.validated_data.get("school")
        if self.request.user.role == "school_admin":
            if role == User.Role.SUPER_ADMIN:
                raise PermissionDenied("A school administrator cannot create a super administrator.")
            school = self.request.user.school
        elif not school:
            raise ValidationError({"school": "Choose the school this account belongs to."})
        password = serializer.validated_data.get("password")
        if not password:
            import secrets
            serializer.validated_data["password"] = secrets.token_urlsafe(18)
        user = serializer.save(school=school)
        AuditLog.objects.create(school=school, actor=self.request.user, action="CREATE", model_name="User",
                                object_id=str(user.pk), after_state={"email": user.email, "role": user.role})

    def perform_update(self, serializer):
        instance = self.get_object()
        if self.request.user.role == "school_admin":
            if instance.role == User.Role.SUPER_ADMIN or serializer.validated_data.get("role") == User.Role.SUPER_ADMIN:
                raise PermissionDenied("A school administrator cannot manage platform administrators.")
            if "school" in serializer.validated_data and serializer.validated_data["school"].pk != self.request.user.school_id:
                raise PermissionDenied("You cannot move an account to another school.")
            serializer.validated_data["school"] = self.request.user.school
        school = serializer.validated_data.get("school", instance.school)
        role = serializer.validated_data.get("role", instance.role)
        if role == User.Role.SUPER_ADMIN and not school:
            raise ValidationError({"school": "Platform administrator accounts must be assigned an organization for sign-in."})
        before = {"email": instance.email, "role": instance.role, "school_id": str(instance.school_id) if instance.school_id else None, "is_active": instance.is_active}
        user = serializer.save()
        AuditLog.objects.create(school=user.school, actor=self.request.user, action="UPDATE", model_name="User",
                                object_id=str(user.pk), before_state=before,
                                after_state={"email": user.email, "role": user.role, "school_id": str(user.school_id) if user.school_id else None, "is_active": user.is_active})

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise PermissionDenied("You cannot delete your own account.")
        if instance.role == User.Role.SUPER_ADMIN:
            raise PermissionDenied("Platform administrator accounts cannot be deleted. Deactivate the account instead.")
        AuditLog.objects.create(school=instance.school, actor=self.request.user, action="DELETE", model_name="User",
                                object_id=str(instance.pk), before_state={"email": instance.email, "role": instance.role})
        instance.delete()
