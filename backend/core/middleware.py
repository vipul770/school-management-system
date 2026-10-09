from django.utils.deprecation import MiddlewareMixin

class TenantMiddleware(MiddlewareMixin):
    """Resolve tenant from authenticated user's membership or explicit organization header."""
    def process_request(self, request):
        request.school = None
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            request.school = getattr(user, "school", None)

class ApiVersionMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.path.startswith("/api/v1/"):
            response["X-API-Version"] = "v1"
        return response
