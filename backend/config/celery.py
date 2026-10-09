import os

from celery import Celery
from celery.schedules import crontab
from kombu import Queue

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
app = Celery("sms")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
app.conf.task_default_queue = "default"
app.conf.task_queues = (Queue("critical"), Queue("default"), Queue("bulk"), Queue("scheduled"))
app.conf.task_routes = {"apps.accounts.tasks.send_password_reset_email": {"queue": "critical"}, "apps.students.tasks.import_students_csv": {"queue": "bulk"}, "apps.reports.tasks.generate_report": {"queue": "bulk"}}
app.conf.beat_schedule = {
    "cleanup-expired-token-records-hourly": {"task": "apps.accounts.tasks.cleanup_expired_tokens", "schedule": crontab(minute=0)},
    "daily-attendance-summary": {"task": "apps.notifications.tasks.daily_attendance_summary", "schedule": crontab(hour=18, minute=0)},
    "monthly-fee-reminders": {"task": "apps.fees.tasks.monthly_fee_reminders", "schedule": crontab(day_of_month=1, hour=9, minute=0)},
    "subscription-expiry-alerts": {"task": "apps.schools.tasks.subscription_expiry_alerts", "schedule": crontab(hour=8, minute=0)},
    "monthly-report-generation": {"task": "apps.reports.tasks.generate_monthly_reports", "schedule": crontab(day_of_month=1, hour=2, minute=0)},
}
