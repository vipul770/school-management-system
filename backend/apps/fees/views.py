from django.db import transaction
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from core.api import TenantModelViewSet
from .models import FeeTransaction, StudentFeeAccount
from .models import FeeInvoice
from apps.students.models import Student
from .tasks import send_fee_reminders
from .serializers import FeeInvoiceSerializer, FeeTransactionSerializer, StudentFeeAccountSerializer
from core.tasks import dispatch_task

class FeeTransactionViewSet(TenantModelViewSet):
    queryset = FeeTransaction.all_objects.all()
    serializer_class = FeeTransactionSerializer
    required_permission = "fees.view"
    filterset_fields = ("student", "payment_mode", "paid_at")
    search_fields = ("transaction_ref", "student__admission_number", "student__first_name", "student__last_name")
    ordering_fields = ("paid_at", "amount")

    def get_queryset(self):
        queryset = super().get_queryset()
        student = self.request.query_params.get("student")
        mode = self.request.query_params.get("payment_mode")
        since = self.request.query_params.get("from")
        until = self.request.query_params.get("to")
        if student: queryset = queryset.filter(student_id=student)
        if mode: queryset = queryset.filter(payment_mode=mode)
        if since: queryset = queryset.filter(paid_at__date__gte=since)
        if until: queryset = queryset.filter(paid_at__date__lte=until)
        return queryset

    def perform_create(self, serializer):
        student = serializer.validated_data.get("student")
        if student.school_id != self.request.user.school_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Student does not belong to your school.")
        with transaction.atomic():
            serializer.save(school=self.request.user.school, collected_by=self.request.user)
            account, _ = StudentFeeAccount.objects.get_or_create(school=self.request.user.school, student=student,
                academic_year=self.request.data.get("academic_year", "current"))
            account.total_paid = FeeTransaction.all_objects.filter(school_id=self.request.user.school_id, student=student).aggregate(total=Sum("amount"))["total"] or 0
            account.save(update_fields=("total_paid", "updated_at"))
            invoice = self.request.data.get("invoice")
            if invoice:
                record = FeeInvoice.all_objects.get(pk=invoice, school_id=self.request.user.school_id, student=student)
                received = FeeTransaction.all_objects.filter(invoice=record).aggregate(total=Sum("amount"))["total"] or 0
                record.status = "paid" if received >= record.amount else "partial"
                record.save(update_fields=("status", "updated_at"))
        self._audit("CREATE", None, serializer.data)

class FeeActionViewSet(TenantModelViewSet):
    queryset = StudentFeeAccount.all_objects.all()
    serializer_class = StudentFeeAccountSerializer
    required_permission = "fees.view"

    def _require_staff(self, request):
        if request.user.role not in ("school_admin", "accountant", "super_admin"):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only school administrators and accountants can view school-wide fee data.")

    @action(detail=False, methods=("get",))
    def defaulters(self, request):
        self._require_staff(request)
        rows = StudentFeeAccount.objects.filter(school_id=request.user.school_id).annotate(balance_value=ExpressionWrapper(F("total_due")-F("total_paid"), output_field=DecimalField())).filter(balance_value__gt=0).select_related("student")
        return Response([{"student_id": r.student_id, "name": f"{r.student.first_name} {r.student.last_name}", "academic_year": r.academic_year, "balance": r.balance_value} for r in rows])

    @action(detail=False, methods=("post",), url_path="send-reminders")
    def send_reminders(self, request):
        self._require_staff(request)
        task = dispatch_task(send_fee_reminders, str(request.user.school_id))
        return Response({"task_id": task.id, "status": "queued"}, status=202)

class FeeInvoiceViewSet(TenantModelViewSet):
    queryset = FeeInvoice.all_objects.all()
    serializer_class = FeeInvoiceSerializer
    required_permission = "fees.view"

    def perform_create(self, serializer):
        student = serializer.validated_data["student"]
        if student.school_id != self.request.user.school_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Student does not belong to your school.")
        with transaction.atomic():
            invoice = serializer.save(school=self.request.user.school)
            account, _ = StudentFeeAccount.objects.get_or_create(school=self.request.user.school, student=student, academic_year=invoice.academic_year or "current")
            account.total_due += invoice.amount
            account.save(update_fields=("total_due", "updated_at"))
        self._audit("CREATE", None, serializer.data)
