from django.db import models
from core.models import TenantModel

class Teacher(TenantModel):
    employee_number = models.CharField(max_length=40)
    user = models.OneToOneField("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="teacher_profile")
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.EmailField(blank=True)
    qualification = models.CharField(max_length=180, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    specialization = models.CharField(max_length=120, blank=True)
    photo = models.URLField(blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "employee_number"), name="uniq_teacher_employee_per_school")]

class SubjectMaster(TenantModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=24)
    class_level = models.CharField(max_length=40, blank=True)
    is_elective = models.BooleanField(default=False)

class ClassAssignment(TenantModel):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="assignments")
    class_section = models.ForeignKey("classes.Classroom", on_delete=models.CASCADE, related_name="teacher_assignments")
    subject = models.ForeignKey(SubjectMaster, on_delete=models.PROTECT)
    is_class_teacher = models.BooleanField(default=False)
    academic_year = models.CharField(max_length=20)
