from core.permissions import HasPermission

class IsSuperAdmin(HasPermission):
    def has_permission(self, request, view): return bool(super().has_permission(request, view) and request.user.role == "super_admin")
class IsSchoolAdmin(HasPermission):
    def has_permission(self, request, view): return bool(super().has_permission(request, view) and request.user.role == "school_admin")
class IsTeacher(HasPermission):
    def has_permission(self, request, view): return bool(super().has_permission(request, view) and request.user.role == "teacher")
class IsStudent(HasPermission):
    def has_permission(self, request, view): return bool(super().has_permission(request, view) and request.user.role == "student")
class IsParent(HasPermission):
    def has_permission(self, request, view): return bool(super().has_permission(request, view) and request.user.role == "parent")
