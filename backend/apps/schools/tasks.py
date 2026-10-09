from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import SchoolSubscription
from apps.accounts.models import User
from apps.notifications.models import Notification

@shared_task
def subscription_expiry_alerts():
    today = timezone.localdate()
    ending = SchoolSubscription.objects.filter(status="active", end_date__gte=today, end_date__lte=today + timedelta(days=7)).select_related("school")
    count = 0
    for subscription in ending:
        recipients = User.objects.filter(school=subscription.school, role=User.Role.SCHOOL_ADMIN)
        for user in recipients:
            Notification.all_objects.create(school=subscription.school, recipient=user, title="Subscription renewal reminder", message=f"Your plan ends on {subscription.end_date}.")
            count += 1
    return {"notifications": count}
