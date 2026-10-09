from core.api import TenantModelViewSet
from core.plans import enforce_plan_limit
from .models import Teacher
from .serializers import TeacherSerializer
from apps.accounts.models import User
from apps.accounts.tasks import send_welcome_email
from core.tasks import dispatch_task

class TeacherViewSet(TenantModelViewSet):
    queryset = Teacher.all_objects.all()
    serializer_class = TeacherSerializer
    required_permission = "teachers.view"

    def perform_create(self, serializer):
        if self.request.user.school_id:
            enforce_plan_limit(self.request.user.school, "teachers")
        school = self.request.user.school
        if not school:
            school_id = self.request.data.get("school") or self.request.query_params.get("school_id")
            from apps.schools.models import School
            school = School.objects.get(pk=school_id)
        email = serializer.validated_data.get("email")
        account = None
        if email:
            if User.objects.filter(email__iexact=email).exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"email": "An account already uses this email address."})
            import secrets
            account = User.objects.create_user(username=f"teacher_{school.pk.hex[:8]}_{secrets.token_hex(5)}", email=email,
                password=secrets.token_urlsafe(24), first_name=serializer.validated_data.get("first_name", ""),
                last_name=serializer.validated_data.get("last_name", ""), school=school, role=User.Role.TEACHER)
        super().perform_create(serializer)
        if account:
            serializer.instance.user = account
            serializer.instance.save(update_fields=("user", "updated_at"))
            dispatch_task(send_welcome_email, account.pk)
