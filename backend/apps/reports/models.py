from django.db import models
from core.models import TenantModel

class ReportJob(TenantModel):
    requested_by = models.ForeignKey("accounts.User", on_delete=models.PROTECT)
    report_type = models.CharField(max_length=80)
    status = models.CharField(max_length=16, default="queued")
    parameters = models.JSONField(default=dict, blank=True)
    result_data = models.JSONField(default=dict, blank=True)
    result_url = models.URLField(blank=True)
