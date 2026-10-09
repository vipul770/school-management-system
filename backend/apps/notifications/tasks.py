import logging
from celery import shared_task
from apps.attendance.models import AttendanceSession
from .services import NotificationService
from django.utils import timezone
from django.db.models import Count
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .models import NotificationLog

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="default", name="notifications.send_attendance_alerts")
def send_attendance_alerts(self, session_id):
    try:
        session = AttendanceSession.all_objects.select_related("school").get(pk=session_id)
        absent = session.student_attendances.select_related("student__user").filter(status="absent")
        for record in absent:
            if record.student.user_id:
                NotificationService.send(session.school, "attendance.absent", record.student.user, {"student": record.student.first_name}, channels=("in_app", "email"))
        return {"notified": absent.count()}
    except Exception as exc:
        logger.exception("Attendance notification task failed")
        raise self.retry(exc=exc)

@shared_task
def daily_attendance_summary():
    today = timezone.localdate()
    return list(AttendanceSession.all_objects.filter(date=today).values("school_id").annotate(sessions=Count("id")))

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="critical")
def deliver_notification(self, log_id):
    log = NotificationLog.all_objects.select_related("recipient", "notification").get(pk=log_id)
    try:
        if log.channel == "email":
            if not log.recipient or not log.recipient.email:
                raise ValueError("Recipient email is not available.")
            send_mail(log.notification.title, log.notification.message, None, [log.recipient.email])
        elif log.channel == "sms":
            from utils.sms import send_sms
            profile = getattr(log.recipient, "student_profile", None) or getattr(log.recipient, "teacher_profile", None)
            phone = getattr(profile, "guardian_phone", "") or getattr(log.recipient, "phone", "")
            if not phone: raise ValueError("Recipient phone number is not available.")
            send_sms(phone, log.notification.message)
        elif log.channel == "push":
            raise RuntimeError("Configure a push notification provider before delivery.")
        log.status = "sent"
        log.sent_at = timezone.now()
        log.error_message = ""
        log.save(update_fields=("status", "sent_at", "error_message", "updated_at"))
    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)[:2000]
        log.save(update_fields=("status", "error_message", "updated_at"))
        raise self.retry(exc=exc)
    return True
