from rest_framework import permissions, serializers, viewsets
from django.db.models import Q
from core.managers import clear_school_context, set_school_context
from core.permissions import HasPermission
from core.models import AuditLog

class TenantModelViewSet(viewsets.ModelViewSet):
    """CRUD base: resolve JWT first, then scope every operation to that school's tenant."""
    permission_classes = (permissions.IsAuthenticated, HasPermission)
    queryset = None
    required_permission = None

    def dispatch(self, request, *args, **kwargs):
        try:
            return super().dispatch(request, *args, **kwargs)
        finally:
            clear_school_context()

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        user = request.user
        self.request.school = getattr(user, "school", None)
        if getattr(user, "role", None) == "super_admin":
            requested = request.query_params.get("school_id")
            set_school_context(requested)
        elif getattr(user, "school_id", None):
            set_school_context(user.school_id)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if getattr(user, "role", None) == "super_admin":
            school_id = self.request.query_params.get("school_id")
            return queryset.filter(school_id=school_id) if school_id else queryset
        if not getattr(user, "school_id", None):
            return queryset.none()
        queryset = queryset.filter(school_id=user.school_id)
        model_name = queryset.model.__name__
        role = getattr(user, "role", "")
        if model_name == "Student":
            if role == "student": queryset = queryset.filter(user=user)
            elif role == "parent": queryset = queryset.filter(guardian_user=user)
            elif role == "teacher": queryset = queryset.filter(enrollments__class_section__teacher_assignments__teacher__user=user).distinct()
        elif model_name == "Teacher" and role == "teacher":
            queryset = queryset.filter(user=user)
        elif model_name == "ClassAssignment" and role == "teacher":
            queryset = queryset.filter(teacher__user=user)
        elif model_name == "SubjectMaster" and role == "teacher":
            queryset = queryset.filter(classassignment__teacher__user=user).distinct()
        elif model_name in ("Enrollment", "StudentDocument"):
            if role == "student": queryset = queryset.filter(student__user=user)
            elif role == "parent": queryset = queryset.filter(student__guardian_user=user)
            elif role == "teacher" and model_name == "Enrollment": queryset = queryset.filter(class_section__teacher_assignments__teacher__user=user).distinct()
            elif role == "teacher": queryset = queryset.filter(student__enrollments__class_section__teacher_assignments__teacher__user=user).distinct()
        elif model_name == "Classroom" and role == "teacher":
            queryset = queryset.filter(teacher_assignments__teacher__user=user).distinct()
        elif model_name in ("AttendanceSession", "ExamTimetable") and role == "teacher":
            queryset = queryset.filter(class_section__teacher_assignments__teacher__user=user).distinct()
        elif model_name == "AttendanceSession" and role in ("student", "parent"):
            rel = "student__user" if role == "student" else "student__guardian_user"
            queryset = queryset.filter(**{f"class_section__enrollments__{rel}": user}).distinct()
        elif model_name == "ExamTimetable" and role in ("student", "parent"):
            rel = "student__user" if role == "student" else "student__guardian_user"
            queryset = queryset.filter(**{f"class_section__enrollments__{rel}": user}).distinct()
        elif model_name == "TeacherAttendance" and role == "teacher":
            queryset = queryset.filter(teacher__user=user)
        elif model_name == "Exam" and role in ("student", "parent"):
            rel = "student__user" if role == "student" else "student__guardian_user"
            queryset = queryset.filter(**{f"timetable__class_section__enrollments__{rel}": user}).distinct()
        elif model_name in ("StudentAttendance", "ExamResult", "StudentFeeAccount", "FeeInvoice", "FeeTransaction"):
            relation = "student__user" if role == "student" else "student__guardian_user" if role == "parent" else None
            if relation: queryset = queryset.filter(**{relation: user})
            elif role == "teacher" and model_name in ("StudentAttendance", "ExamResult"):
                relation = "session__class_section__teacher_assignments__teacher__user" if model_name == "StudentAttendance" else "student__enrollments__class_section__teacher_assignments__teacher__user"
                queryset = queryset.filter(**{relation: user}).distinct()
        elif model_name in ("Assignment", "AssignmentSubmission"):
            if role == "teacher":
                queryset = queryset.filter(Q(teacher__user=user) | Q(class_section__teacher_assignments__teacher__user=user)).distinct() if model_name == "Assignment" else queryset.filter(assignment__teacher__user=user).distinct()
            elif role == "student":
                queryset = queryset.filter(student__user=user) if model_name == "AssignmentSubmission" else queryset.filter(class_section__enrollments__student__user=user).distinct()
        elif model_name == "Notification":
            queryset = queryset.filter(recipient=user)
        elif model_name == "NotificationLog":
            queryset = queryset.filter(recipient=user)
        elif model_name == "NotificationTemplate" and role in ("student", "parent"):
            queryset = queryset.none()
        elif model_name == "ReportCard" and role in ("student", "parent"):
            queryset = queryset.filter(**{"student__user" if role == "student" else "student__guardian_user": user})
        elif model_name == "Message":
            queryset = queryset.filter(Q(sender=user) | Q(recipient=user))
        return queryset

    def perform_create(self, serializer):
        if self.queryset.model.__name__ == "SchoolSubscription" and self.request.user.role != "super_admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Subscription changes must be completed through billing.")
        school_id = getattr(self.request.user, "school_id", None)
        if not school_id and self.request.user.role == "super_admin":
            school_id = self.request.data.get("school") or self.request.query_params.get("school_id")
        if not school_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("A school membership is required.")
        from apps.schools.models import School
        extra = {}
        model_fields = {field.name for field in self.queryset.model._meta.fields}
        for field in ("requested_by", "sender", "author", "collected_by"):
            if field in model_fields:
                extra[field] = self.request.user
        serializer.save(school=School.objects.get(pk=school_id), **extra)
        self._audit("CREATE", None, serializer.data)

    def perform_update(self, serializer):
        if self.queryset.model.__name__ == "SchoolSubscription" and self.request.user.role != "super_admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Subscription state is managed by billing.")
        before = self.get_serializer(self.get_object()).data
        serializer.save()
        self._audit("UPDATE", before, serializer.data)

    def perform_destroy(self, instance):
        if self.queryset.model.__name__ == "SchoolSubscription" and self.request.user.role != "super_admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Subscription state is managed by billing.")
        before = self.get_serializer(instance).data
        self._audit("DELETE", before, None)
        instance.delete()

    def _audit(self, action, before, after):
        school_id = getattr(self.request.user, "school_id", None) or self.request.data.get("school")
        remote = self.request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or self.request.META.get("REMOTE_ADDR")
        state = after or before or {}
        AuditLog.objects.create(school_id=school_id, actor=self.request.user, action=action,
            model_name=self.queryset.model.__name__, object_id=str(state.get("id", "new")),
            before_state=before, after_state=after, ip_address=remote or None,
            user_agent=self.request.META.get("HTTP_USER_AGENT", "")[:512])

def model_serializer(model):
    meta = type("Meta", (), {"model": model, "fields": "__all__",
        "read_only_fields": tuple(field.name for field in model._meta.fields if field.auto_created or field.name in {"created_at", "updated_at", "school", "sender", "author", "requested_by", "collected_by"})})
    def validate(self, attrs):
        request = self.context.get("request")
        school_id = getattr(request.user, "school_id", None) or request.data.get("school") or request.query_params.get("school_id")
        if not school_id:
            return attrs
        for field in model._meta.fields:
            if not getattr(field, "is_relation", False) or not (getattr(field, "many_to_one", False) or getattr(field, "one_to_one", False)):
                continue
            value = attrs.get(field.name, getattr(self.instance, field.name, None) if self.instance else None)
            if value is not None and hasattr(value, "school_id") and value.school_id != school_id:
                raise serializers.ValidationError({field.name: "This record belongs to another school."})
        return attrs
    serializer_class = type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": meta, "validate": validate})
    return serializer_class

def model_viewset(model, permission, serializer_class=None):
    return type(f"{model.__name__}ViewSet", (TenantModelViewSet,), {
        "queryset": model.all_objects.all() if hasattr(model, "all_objects") else model.objects.all(),
        "serializer_class": serializer_class or model_serializer(model), "required_permission": permission,
    })
