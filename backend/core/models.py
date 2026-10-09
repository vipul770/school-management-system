import uuid

from django.db import models
from .managers import TenantManager

class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class TenantModel(TimeStampedModel):
    school = models.ForeignKey("schools.School", on_delete=models.CASCADE, db_index=True)
    objects = TenantManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True
        indexes = [models.Index(fields=("school", "created_at"), name="%(class)s_tnt_cr")]

class AuditLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    school = models.ForeignKey("schools.School", null=True, on_delete=models.SET_NULL)
    actor = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=12)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=64)
    before_state = models.JSONField(null=True, blank=True)
    after_state = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
