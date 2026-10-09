from django.core.mail import send_mail

def send_notification_email(subject, message, recipient):
    return send_mail(subject, message, None, [recipient], fail_silently=False)
