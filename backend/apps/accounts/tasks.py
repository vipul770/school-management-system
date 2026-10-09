from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="critical")
def send_password_reset_email(self, user_id, otp):
    user = get_user_model().objects.filter(pk=user_id).first()
    if not user or not user.email:
        return False
    try:
        send_mail("Your password reset code", f"Your verification code is {otp}. It expires in one hour.", None, [user.email])
    except Exception as exc:
        raise self.retry(exc=exc)
    return True

@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue="critical")
def send_welcome_email(self, user_id):
    user = get_user_model().objects.filter(pk=user_id).first()
    if user and user.email:
        send_mail("Welcome to the school platform", "Your school account is ready.", None, [user.email])

@shared_task
def cleanup_expired_tokens():
    return OutstandingToken.objects.filter(expires_at__lt=timezone.now()).delete()[0]
