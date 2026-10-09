from rest_framework_simplejwt.tokens import RefreshToken
from core.permissions import ROLE_PERMISSIONS

def issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    for token in (refresh, refresh.access_token):
        token["school_id"] = str(user.school_id) if user.school_id else None
        token["role"] = user.role
        token["permissions"] = list(ROLE_PERMISSIONS.get(user.role, ()))
    return str(refresh.access_token), str(refresh)
