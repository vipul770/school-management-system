from rest_framework.exceptions import PermissionDenied
from apps.schools.models import SchoolSubscription

def enforce_plan_limit(school, profile_name):
    subscription = SchoolSubscription.objects.filter(school=school, status="active").select_related("plan").first()
    if not subscription:
        return
    field = "max_students" if profile_name == "students" else "max_teachers"
    limit = getattr(subscription.plan, field)
    from django.apps import apps
    model = apps.get_model("students", "Student") if profile_name == "students" else apps.get_model("teachers", "Teacher")
    count = model.all_objects.filter(school=school).count()
    if limit and count >= limit:
        raise PermissionDenied(f"The {subscription.plan.name} plan allows up to {limit} {profile_name}.")
