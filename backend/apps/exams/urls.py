from rest_framework.routers import SimpleRouter
from .views import ExamViewSet, ExamResultViewSet, ExamTimetableViewSet, GradingScaleViewSet, ReportCardViewSet

router = SimpleRouter()
router.register("exams", ExamViewSet, basename="exams")
router.register("exam-timetable", ExamTimetableViewSet, basename="exam-timetable")
router.register("exam-results", ExamResultViewSet, basename="exam-results")
router.register("grading-scales", GradingScaleViewSet, basename="grading-scales")
router.register("report-cards", ReportCardViewSet, basename="report-cards")
urlpatterns = router.urls
