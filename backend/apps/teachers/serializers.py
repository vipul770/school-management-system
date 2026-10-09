from core.api import model_serializer
from .models import ClassAssignment, SubjectMaster, Teacher

TeacherSerializer = model_serializer(Teacher)
SubjectMasterSerializer = model_serializer(SubjectMaster)
ClassAssignmentSerializer = model_serializer(ClassAssignment)
