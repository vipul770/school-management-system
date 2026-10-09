from core.api import model_viewset
from .models import Notification, NotificationLog, NotificationTemplate
from .serializers import NotificationLogSerializer, NotificationSerializer, NotificationTemplateSerializer

NotificationViewSet = model_viewset(Notification, "notifications.view", NotificationSerializer)
NotificationTemplateViewSet = model_viewset(NotificationTemplate, "notifications.view", NotificationTemplateSerializer)
NotificationLogViewSet = model_viewset(NotificationLog, "notifications.view", NotificationLogSerializer)
