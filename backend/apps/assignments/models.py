from django.db import models
from core.models import TenantModel

class Assignment(TenantModel):
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    due_at = models.DateTimeField()
    class_section = models.ForeignKey("classes.Classroom", null=True, blank=True, on_delete=models.CASCADE, related_name="assignments")
    teacher = models.ForeignKey("teachers.Teacher", null=True, blank=True, on_delete=models.SET_NULL)

class AssignmentSubmission(TenantModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to="assignment-submissions/", blank=True)
    grade = models.CharField(max_length=20, blank=True)
    feedback = models.TextField(blank=True)
