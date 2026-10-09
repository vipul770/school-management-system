from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    organization_id = serializers.CharField(source="school.organization_id", read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "organization_id")
