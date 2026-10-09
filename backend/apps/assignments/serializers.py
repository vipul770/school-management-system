from core.api import model_serializer
from .models import Assignment, AssignmentSubmission

AssignmentSerializer = model_serializer(Assignment)
AssignmentSubmissionSerializer = model_serializer(AssignmentSubmission)
