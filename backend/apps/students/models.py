from django.db import models
from django.db.models import Q
from core.models import TenantModel

class Student(TenantModel):
    admission_number = models.CharField(max_length=40)
    roll_number = models.CharField(max_length=40, blank=True)
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    user = models.OneToOneField("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="student_profile")
    guardian_user = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.EmailField(blank=True)
    guardian_name = models.CharField(max_length=160, blank=True)
    guardian_phone = models.CharField(max_length=32, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    photo = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "admission_number"), name="uniq_student_admission_per_school")]

class Enrollment(TenantModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    class_section = models.ForeignKey("classes.Classroom", on_delete=models.PROTECT, related_name="enrollments")
    academic_year = models.CharField(max_length=20)
    enrollment_date = models.DateField()
    status = models.CharField(max_length=16, default="active", choices=(("active", "Active"), ("transferred", "Transferred"), ("graduated", "Graduated")))
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "student", "academic_year"), name="uniq_enrollment_year_per_school")]
        indexes = [models.Index(fields=("school", "class_section"), condition=Q(status="active"), name="enroll_active_school_class_idx")]

class StudentDocument(TenantModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="documents")
    doc_type = models.CharField(max_length=40)
    file = models.FileField(upload_to="student-documents/")
