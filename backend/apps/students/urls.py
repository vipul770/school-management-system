from rest_framework.routers import SimpleRouter
from core.api import model_viewset
from .models import Enrollment, StudentDocument
from .serializers import EnrollmentSerializer, StudentDocumentSerializer
from .views import StudentViewSet

router = SimpleRouter()
router.register("students", StudentViewSet, basename="students")
router.register("enrollments", model_viewset(Enrollment, "students.view", EnrollmentSerializer), basename="enrollments")
router.register("student-documents", model_viewset(StudentDocument, "students.view", StudentDocumentSerializer), basename="student-documents")
urlpatterns = router.urls
