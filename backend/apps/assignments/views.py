from core.api import model_viewset
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer

AssignmentViewSet = model_viewset(Assignment, "assignments.view", AssignmentSerializer)
AssignmentSubmissionViewSet = model_viewset(AssignmentSubmission, "assignments.view", AssignmentSubmissionSerializer)
