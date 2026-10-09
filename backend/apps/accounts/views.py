from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .services import issue_tokens
from .tasks import send_password_reset_email
from core.tasks import dispatch_task

User = get_user_model()

class OrganizationLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        organization_id = request.data.get("organization_id")
        identity = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")
        if not organization_id or not identity or not password:
            return Response({"detail": "Organization ID, email, and password are required."}, status=400)
        username = User.objects.filter(email__iexact=identity).values_list("username", flat=True).first() or identity
        user = authenticate(request, username=username, password=password)
        if not user or not user.is_active or not user.school or not user.school.is_active or user.school.organization_id != organization_id:
            return Response({"detail": "Invalid organization or credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        access, refresh = issue_tokens(user)
        response = Response({"access": access, "user": UserSerializer(user).data})
        response.set_cookie("refresh_token", refresh, httponly=True, secure=request.is_secure(), samesite="Strict", max_age=7 * 24 * 60 * 60, path="/api/v1/auth/")
        return response

class CurrentUserView(APIView):
    def get(self, request):
        data = UserSerializer(request.user).data
        from core.permissions import ROLE_PERMISSIONS
        data["permissions"] = list(ROLE_PERMISSIONS.get(request.user.role, ()))
        return Response(data)

class LogoutView(APIView):
    def post(self, request):
        token = request.data.get("refresh") or request.COOKIES.get("refresh_token")
        if token:
            try:
                RefreshToken(token).blacklist()
            except Exception:
                pass
        response = Response(status=status.HTTP_205_RESET_CONTENT)
        response.delete_cookie("refresh_token", path="/api/v1/auth/")
        return response

class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        from rest_framework_simplejwt.serializers import TokenRefreshSerializer
        token = request.data.get("refresh") or request.COOKIES.get("refresh_token")
        if not token:
            return Response({"detail": "Refresh token is missing."}, status=401)
        serializer = TokenRefreshSerializer(data={"refresh": token})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        response = Response({"access": data["access"]})
        if data.get("refresh"):
            response.set_cookie("refresh_token", data["refresh"], httponly=True, secure=request.is_secure(), samesite="Strict", max_age=7 * 24 * 60 * 60, path="/api/v1/auth/")
        return response

class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            from secrets import randbelow
            otp = f"{randbelow(1_000_000):06d}"
            cache.set(f"sms:password-reset:{user.pk}", otp, timeout=3600)
            dispatch_task(send_password_reset_email, user.pk, otp)
        return Response({"detail": "If the account exists, a reset code will be sent."}, status=202)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        key = f"sms:password-reset:{user.pk}" if user else ""
        otp = cache.get(key) if key else None
        if not user or not otp or otp != request.data.get("otp") or not request.data.get("new_password"):
            return Response({"detail": "The reset code is invalid or expired."}, status=400)
        user.set_password(request.data["new_password"])
        user.save(update_fields=("password",))
        cache.delete(key)
        return Response({"detail": "Password updated."})

class ChangePasswordView(APIView):
    def post(self, request):
        if not request.user.check_password(request.data.get("current_password", "")):
            return Response({"detail": "Current password is incorrect."}, status=400)
        password = request.data.get("new_password", "")
        if len(password) < 10:
            return Response({"detail": "New password must be at least 10 characters."}, status=400)
        request.user.set_password(password)
        request.user.save(update_fields=("password",))
        return Response({"detail": "Password updated."})
