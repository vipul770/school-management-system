from django.db import models
from core.models import TimeStampedModel

class School(TimeStampedModel):
    name = models.CharField(max_length=180)
    organization_id = models.SlugField(max_length=48, unique=True)
    subdomain = models.SlugField(max_length=80, unique=True, null=True, blank=True)
    logo = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)
    timezone = models.CharField(max_length=64, default="Asia/Kolkata")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class SubscriptionPlan(TimeStampedModel):
    name = models.CharField(max_length=64, unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_students = models.PositiveIntegerField(default=200)
    max_teachers = models.PositiveIntegerField(default=20)
    features = models.JSONField(default=list, blank=True)
    stripe_price_id = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)

class SchoolSubscription(TimeStampedModel):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, default="active")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=120, blank=True)

class FeatureFlag(TimeStampedModel):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="feature_flags")
    feature_key = models.SlugField(max_length=100)
    is_enabled = models.BooleanField(default=False)
    config = models.JSONField(default=dict, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "feature_key"), name="uniq_school_feature_flag")]

class SchoolSettings(TimeStampedModel):
    school = models.OneToOneField(School, on_delete=models.CASCADE, related_name="settings")
    academic_year_start = models.DateField(null=True, blank=True)
    grading_system = models.CharField(max_length=40, default="percentage")
    currency = models.CharField(max_length=3, default="USD")
    sms_provider_config = models.JSONField(default=dict, blank=True)
