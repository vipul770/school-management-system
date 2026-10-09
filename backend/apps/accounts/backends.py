from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get("email") or username
        User = self.get_user_model()
        user = User.objects.filter(email__iexact=email).first()
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user

    @staticmethod
    def get_user_model():
        from django.contrib.auth import get_user_model
        return get_user_model()
