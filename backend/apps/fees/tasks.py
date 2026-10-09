from celery import shared_task
from django.utils import timezone
from .models import FeeReminder, StudentFeeAccount

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="default")
def send_fee_reminders(self, school_id):
    count = 0
    for account in StudentFeeAccount.objects.filter(school_id=school_id).select_related("student__user", "student__guardian_user", "school"):
        if account.balance > 0:
            FeeReminder.objects.create(school_id=school_id, student=account.student, due_date=timezone.localdate(), channel="email", status="queued")
            recipient = account.student.guardian_user or account.student.user
            if recipient:
                from apps.notifications.services import NotificationService
                NotificationService.send(account.school, "fees.reminder", recipient, {"balance": str(account.balance)}, channels=("email",))
            count += 1
    return {"queued": count}

@shared_task
def monthly_fee_reminders():
    from apps.schools.models import School
    total = 0
    for school_id in School.objects.filter(is_active=True).values_list("pk", flat=True):
        result = send_fee_reminders.run(str(school_id))
        total += result.get("queued", 0)
    return {"queued": total}
