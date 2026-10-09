from core.api import model_serializer
from .models import Notification, NotificationLog, NotificationTemplate

NotificationSerializer = model_serializer(Notification)
NotificationLogSerializer = model_serializer(NotificationLog)
NotificationTemplateSerializer = model_serializer(NotificationTemplate)
