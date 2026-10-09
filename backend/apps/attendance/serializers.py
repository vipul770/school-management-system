from core.api import model_serializer
from .models import AttendanceSession, StudentAttendance, TeacherAttendance

AttendanceSessionSerializer = model_serializer(AttendanceSession)
StudentAttendanceSerializer = model_serializer(StudentAttendance)
TeacherAttendanceSerializer = model_serializer(TeacherAttendance)
