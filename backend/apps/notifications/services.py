from django.core.cache import cache
from .models import Notification, NotificationLog, NotificationTemplate
from core.tasks import dispatch_task

class NotificationService:
    @staticmethod
    def send(school, event_type, recipient_user, context=None, channels=("email",)):
        template = NotificationTemplate.objects.filter(school=school, event_type=event_type, channel="email").first()
        title = template.subject if template else event_type.replace(".", " ").title()
        body = template.body if template else "You have a new school notification."
        notification = Notification.objects.create(school=school, recipient=recipient_user, title=title, message=body)
        for channel in channels:
            log = NotificationLog.objects.create(school=school, notification=notification, recipient=recipient_user, channel=channel, event_type=event_type, status="queued")
            if channel in ("email", "sms", "push"):
                from .tasks import deliver_notification
                dispatch_task(deliver_notification, str(log.pk))
        return notification
