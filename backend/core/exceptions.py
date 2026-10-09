from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler

class TenantContextRequired(APIException):
    status_code = 400
    default_detail = "An organization context is required."
    default_code = "tenant_required"

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response
    detail = response.data
    message = detail.get("detail", "Request validation failed.") if isinstance(detail, dict) else "Request validation failed."
    response.data = {"status": "error", "error": {"code": getattr(exc, "default_code", "request_error"), "message": str(message), "details": detail}}
    return response
