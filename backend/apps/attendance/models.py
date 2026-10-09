from django.db import models
from core.models import TenantModel

class AttendanceSession(TenantModel):
    class_section = models.ForeignKey("classes.Classroom", on_delete=models.CASCADE, related_name="attendance_sessions")
    date = models.DateField(db_index=True)
    taken_by = models.ForeignKey("teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=12, default="open", choices=(("open", "Open"), ("submitted", "Submitted"), ("locked", "Locked")))
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "class_section", "date"), name="uniq_attendance_session_class_day")]

class StudentAttendance(TenantModel):
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name="student_attendances")
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    status = models.CharField(max_length=12, choices=(("present", "Present"), ("absent", "Absent"), ("late", "Late"), ("excused", "Excused")))
    remarks = models.CharField(max_length=240, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=("session", "student"), name="uniq_session_student_attendance")]
        indexes = [models.Index(fields=("school", "session", "student"), name="attendance_school_sess_stu_idx")]

class TeacherAttendance(TenantModel):
    teacher = models.ForeignKey("teachers.Teacher", on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=16, default="present")
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "teacher", "date"), name="uniq_teacher_attendance_day")]
