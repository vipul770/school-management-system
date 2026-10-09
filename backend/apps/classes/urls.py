from rest_framework.routers import SimpleRouter
from .views import ClassroomViewSet, TimetableEntryViewSet

router = SimpleRouter()
router.register("classes", ClassroomViewSet, basename="classes")
router.register("timetable", TimetableEntryViewSet, basename="timetable")
urlpatterns = router.urls
