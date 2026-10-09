from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super admin"
        SCHOOL_ADMIN = "school_admin", "School admin"
        TEACHER = "teacher", "Teacher"
        STUDENT = "student", "Student"
        PARENT = "parent", "Parent"
        ACCOUNTANT = "accountant", "Accountant"

    school = models.ForeignKey("schools.School", null=True, blank=True, on_delete=models.CASCADE, related_name="users")
    role = models.CharField(max_length=24, choices=Role.choices, default=Role.SCHOOL_ADMIN)
    email = models.EmailField(unique=True)
