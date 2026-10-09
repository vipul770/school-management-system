from rest_framework.routers import SimpleRouter
from .views import NotificationLogViewSet, NotificationTemplateViewSet, NotificationViewSet

router = SimpleRouter()
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("notification-templates", NotificationTemplateViewSet, basename="notification-templates")
router.register("notification-logs", NotificationLogViewSet, basename="notification-logs")
urlpatterns = router.urls
