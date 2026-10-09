from rest_framework.routers import SimpleRouter
from core.api import model_viewset
from .models import ClassAssignment, SubjectMaster
from .views import TeacherViewSet
from .serializers import ClassAssignmentSerializer, SubjectMasterSerializer

router = SimpleRouter()
router.register("teachers", TeacherViewSet, basename="teachers")
router.register("subjects", model_viewset(SubjectMaster, "teachers.view", SubjectMasterSerializer), basename="subjects")
router.register("class-assignments", model_viewset(ClassAssignment, "teachers.view", ClassAssignmentSerializer), basename="class-assignments")
urlpatterns = router.urls
