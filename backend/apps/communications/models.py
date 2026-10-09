from django.db import models
from core.models import TenantModel

class Message(TenantModel):
    sender = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="sent_messages")
    subject = models.CharField(max_length=160)
    body = models.TextField()
    recipient = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="received_messages")
    sent_at = models.DateTimeField(null=True, blank=True)

class Announcement(TenantModel):
    author = models.ForeignKey("accounts.User", on_delete=models.PROTECT)
    title = models.CharField(max_length=160)
    body = models.TextField()
    audience = models.CharField(max_length=24, default="all")
    published_at = models.DateTimeField(null=True, blank=True)
