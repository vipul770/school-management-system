from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class SMSUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("School access", {"fields": ("school", "role")}),)
    list_display = ("username", "email", "school", "role", "is_active")
