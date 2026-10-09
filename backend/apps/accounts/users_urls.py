from rest_framework.routers import DefaultRouter
from .user_views import UserManagementViewSet

router = DefaultRouter()
router.register("users", UserManagementViewSet, basename="account-users")
urlpatterns = router.urls
