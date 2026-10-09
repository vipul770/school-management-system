from core.api import model_serializer
from .models import Enrollment, Student, StudentDocument

StudentSerializer = model_serializer(Student)
EnrollmentSerializer = model_serializer(Enrollment)
StudentDocumentSerializer = model_serializer(StudentDocument)
