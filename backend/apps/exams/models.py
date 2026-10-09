from django.db import models
from core.models import TenantModel

class Exam(TenantModel):
    name = models.CharField(max_length=120)
    academic_year = models.CharField(max_length=20, default="")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

class ExamTimetable(TenantModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="timetable")
    class_section = models.ForeignKey("classes.Classroom", on_delete=models.CASCADE)
    subject = models.ForeignKey("teachers.SubjectMaster", on_delete=models.PROTECT)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=40, blank=True)

class ExamResult(TenantModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="results")
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE, related_name="exam_results")
    subject = models.ForeignKey("teachers.SubjectMaster", on_delete=models.PROTECT)
    marks_obtained = models.DecimalField(max_digits=7, decimal_places=2)
    max_marks = models.DecimalField(max_digits=7, decimal_places=2)
    grade = models.CharField(max_length=8, blank=True)
    remarks = models.CharField(max_length=240, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "exam", "student", "subject"), name="uniq_exam_student_subject")]
        indexes = [models.Index(fields=("school", "exam", "student"), name="exams_school_exam_student_idx")]

class GradingScale(TenantModel):
    name = models.CharField(max_length=50)
    min_percent = models.DecimalField(max_digits=5, decimal_places=2)
    max_percent = models.DecimalField(max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, default=0)

class ReportCard(TenantModel):
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    generated_at = models.DateTimeField(auto_now_add=True)
    pdf_url = models.URLField(blank=True)
