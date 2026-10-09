from rest_framework.routers import SimpleRouter
from .views import ReportJobViewSet

router = SimpleRouter()
router.register("reports/jobs", ReportJobViewSet, basename="report-jobs")
urlpatterns = router.urls
