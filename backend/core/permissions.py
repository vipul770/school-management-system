from rest_framework.permissions import BasePermission

class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "school_id", None))

class HasSchoolRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)

ROLE_PERMISSIONS = {
    "super_admin": {"*"},
    "school_admin": {"accounts.*", "students.*", "teachers.*", "classes.*", "attendance.*", "fees.*", "exams.*", "assignments.*", "notifications.*", "reports.*", "communications.*", "schools.*", "audit.view"},
    "teacher": {"attendance.view", "attendance.create", "attendance.update", "exams.view", "exams.results.create", "assignments.*", "students.view", "teachers.view", "classes.view", "notifications.view", "notifications.create", "communications.*"},
    "student": {"students.view_own", "attendance.view_own", "exams.results.view_own", "fees.view_own", "assignments.view", "assignments.submit", "notifications.view"},
    "parent": {"students.view_child", "attendance.view_child", "exams.results.view_child", "fees.view_child", "notifications.view"},
    "accountant": {"fees.*", "students.view", "reports.view"},
}

class HasPermission(BasePermission):
    required_permission = None

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        action = getattr(view, "action", None)
        if action in {"create", "update", "partial_update", "destroy", "submit", "bulk_import", "send_reminders"} and getattr(user, "school_id", None):
            from apps.schools.models import SchoolSubscription
            sub = SchoolSubscription.objects.filter(school_id=user.school_id, status__in=("canceled", "past_due", "expired", "suspended")).order_by("-created_at").first()
            if sub:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("This school's subscription is read-only. Update billing to make changes.")
        permissions = ROLE_PERMISSIONS.get(getattr(user, "role", ""), set())
        required = self.required_permission or getattr(view, "required_permission", None)
        role = getattr(user, "role", "")
        if required == "students.view" and role == "student": required = "students.view_own"
        if required == "students.view" and role == "parent": required = "students.view_child"
        if required == "attendance.view" and role == "student" and action in ("list", "retrieve"): required = "attendance.view_own"
        if required == "attendance.view" and role == "parent" and action in ("list", "retrieve"): required = "attendance.view_child"
        if required == "fees.view" and role in ("student", "parent"): required = "fees.view_own" if role == "student" else "fees.view_child"
        if required == "exams.view" and role in ("student", "parent"): required = "exams.results.view_own" if role == "student" else "exams.results.view_child"
        operation = {"create": "create", "update": "update", "partial_update": "update", "destroy": "delete"}.get(action)
        if action == "submit": operation = "update"
        if action in {"bulk_import", "send_reminders"}: operation = "create"
        if required and operation:
            required = required.rsplit(".", 1)[0] + "." + operation
        return "*" in permissions or not required or required in permissions or any(
            rule.endswith(".*") and required.startswith(rule[:-1]) for rule in permissions
        )

class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or getattr(request.user, "school_id", None)))
