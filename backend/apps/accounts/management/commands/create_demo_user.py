from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.schools.models import School
from apps.schools.models import FeatureFlag, SchoolSettings, SchoolSubscription, SubscriptionPlan
from django.utils import timezone

class Command(BaseCommand):
    help = "Create the demo school and a login account for every supported role."

    def handle(self, *args, **options):
        plans = [
            ("Starter", 29, 200, 20, ["students", "teachers", "attendance", "classes"]),
            ("Professional", 79, 1000, 100, ["students", "teachers", "attendance", "classes", "fees", "reports"]),
            ("Enterprise", 199, 5000, 500, ["all", "custom_branding", "api_access"]),
        ]
        for name, price, student_limit, teacher_limit, features in plans:
            SubscriptionPlan.objects.update_or_create(name=name, defaults={"price_monthly": price, "max_students": student_limit, "max_teachers": teacher_limit, "features": features})
        school, _ = School.objects.get_or_create(organization_id="demo-school", defaults={"name": "Demo School"})
        SchoolSettings.objects.get_or_create(school=school)
        starter = SubscriptionPlan.objects.get(name="Starter")
        SchoolSubscription.objects.get_or_create(school=school, status="active", defaults={"plan": starter, "start_date": timezone.localdate()})
        for key, enabled in (("sms_notifications", False), ("advanced_analytics", False), ("fee_management", True)):
            FeatureFlag.objects.get_or_create(school=school, feature_key=key, defaults={"is_enabled": enabled})
        # Keep the existing admin login intact, and seed one clearly named account
        # for each remaining role. This command is safe to rerun.
        users = [
            ("demo", "demo@example.test", "Demo", "Administrator", User.Role.SCHOOL_ADMIN),
            ("demo_super_admin", "superadmin@demo-school.test", "Demo", "Platform Admin", User.Role.SUPER_ADMIN),
            ("demo_teacher", "teacher@demo-school.test", "Taylor", "Teacher", User.Role.TEACHER),
            ("demo_student", "student@demo-school.test", "Sam", "Student", User.Role.STUDENT),
            ("demo_parent", "parent@demo-school.test", "Pat", "Parent", User.Role.PARENT),
            ("demo_accountant", "accountant@demo-school.test", "Alex", "Accountant", User.Role.ACCOUNTANT),
        ]
        password = "DemoSchool2026!"
        for username, email, first_name, last_name, role in users:
            user, created = User.objects.get_or_create(username=username, defaults={
                "email": email, "first_name": first_name, "last_name": last_name,
                "role": role, "school": school,
            })
            if created:
                user.set_password(password)
                user.save(update_fields=("password",))
            self.stdout.write(f"{'Created' if created else 'Ready'} {role}: {username} ({email})")
        self.stdout.write(self.style.SUCCESS(f"Demo accounts use organization_id=demo-school and password={password} (except the existing demo admin account)."))
