from rest_framework.routers import SimpleRouter
from core.api import model_viewset
from .models import FeatureFlag, SchoolSettings, SchoolSubscription
from .plan_views import PlatformSubscriptionViewSet, SubscriptionPlanViewSet
from .views import SchoolViewSet
from apps.schools.serializers import SchoolSubscriptionSerializer, FeatureFlagSerializer, SchoolSettingsSerializer

router = SimpleRouter()
router.register("schools", SchoolViewSet, basename="schools")
router.register("subscription-plans", SubscriptionPlanViewSet, basename="subscription-plans")
router.register("subscriptions", PlatformSubscriptionViewSet, basename="subscriptions")
router.register("feature-flags", model_viewset(FeatureFlag, "schools.view", FeatureFlagSerializer), basename="feature-flags")
router.register("school-settings", model_viewset(SchoolSettings, "schools.view", SchoolSettingsSerializer), basename="school-settings")
urlpatterns = router.urls
