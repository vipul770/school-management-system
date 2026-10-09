from django.db import models
import threading

_tenant_context = threading.local()

def set_school_context(school_id):
    _tenant_context.school_id = school_id

def clear_school_context():
    _tenant_context.school_id = None

class TenantQuerySet(models.QuerySet):
    def for_school(self, school):
        return self.filter(school=school)

class TenantManager(models.Manager.from_queryset(TenantQuerySet)):
    def get_queryset(self):
        queryset = super().get_queryset()
        school_id = getattr(_tenant_context, "school_id", None)
        return queryset.filter(school_id=school_id) if school_id else queryset

    def unscoped(self):
        return super().get_queryset()
