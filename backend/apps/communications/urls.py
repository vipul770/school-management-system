from rest_framework.routers import SimpleRouter
from .views import AnnouncementViewSet, MessageViewSet

router = SimpleRouter()
router.register("communications/messages", MessageViewSet, basename="messages")
router.register("communications/announcements", AnnouncementViewSet, basename="announcements")
urlpatterns = router.urls
