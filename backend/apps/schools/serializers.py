from rest_framework import serializers
from core.api import model_serializer
from .models import FeatureFlag, School, SchoolSettings, SchoolSubscription

SchoolSerializer = model_serializer(School)
SchoolSubscriptionSerializer = model_serializer(SchoolSubscription)
FeatureFlagSerializer = model_serializer(FeatureFlag)
SchoolSettingsSerializer = model_serializer(SchoolSettings)

class SchoolOnboardingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=180)
    organization_id = serializers.SlugField(max_length=48)
    email = serializers.EmailField()
    admin_email = serializers.EmailField()
    admin_username = serializers.CharField(max_length=150)
    admin_password = serializers.CharField(min_length=10, write_only=True)
