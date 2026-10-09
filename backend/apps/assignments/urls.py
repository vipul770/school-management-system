from rest_framework.routers import SimpleRouter
from .views import AssignmentSubmissionViewSet, AssignmentViewSet

router = SimpleRouter()
router.register("assignments", AssignmentViewSet, basename="assignments")
router.register("assignment-submissions", AssignmentSubmissionViewSet, basename="assignment-submissions")
urlpatterns = router.urls
