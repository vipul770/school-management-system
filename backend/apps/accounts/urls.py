from django.urls import path
from .views import (ChangePasswordView, CookieTokenRefreshView, CurrentUserView,
                    LogoutView, OrganizationLoginView, PasswordResetConfirmView, PasswordResetView)

urlpatterns = [
    path("login/", OrganizationLoginView.as_view(), name="organization-login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
