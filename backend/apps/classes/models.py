from django.db import models
from core.models import TenantModel

class Classroom(TenantModel):
    name = models.CharField(max_length=80)
    grade = models.CharField(max_length=40)
    academic_year = models.CharField(max_length=20)
    section = models.CharField(max_length=10, default="A")
    class_teacher = models.ForeignKey("teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL, related_name="homerooms")
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "name", "academic_year"), name="uniq_class_name_year_per_school")]

class TimetableEntry(TenantModel):
    class_section = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="timetable")
    subject = models.ForeignKey("teachers.SubjectMaster", on_delete=models.PROTECT)
    teacher = models.ForeignKey("teachers.Teacher", on_delete=models.PROTECT)
    weekday = models.PositiveSmallIntegerField()
    starts_at = models.TimeField()
    ends_at = models.TimeField()
    room = models.CharField(max_length=40, blank=True)
