from django.db import models
from core.models import TenantModel

class Notification(TenantModel):
    recipient = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    message = models.TextField()
    read_at = models.DateTimeField(null=True, blank=True)

class NotificationTemplate(TenantModel):
    event_type = models.CharField(max_length=80)
    channel = models.CharField(max_length=12, choices=(("email", "Email"), ("sms", "SMS"), ("push", "Push")))
    subject = models.CharField(max_length=180, blank=True)
    body = models.TextField()
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "event_type", "channel"), name="uniq_notification_event_channel")]

class NotificationLog(TenantModel):
    notification = models.ForeignKey(Notification, null=True, blank=True, on_delete=models.SET_NULL, related_name="delivery_logs")
    recipient = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL)
    channel = models.CharField(max_length=12)
    event_type = models.CharField(max_length=80)
    status = models.CharField(max_length=16, default="queued")
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

class DeviceToken(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="device_tokens")
    token = models.CharField(max_length=512, unique=True)
    platform = models.CharField(max_length=12)
    is_active = models.BooleanField(default=True)
