from rest_framework.routers import SimpleRouter
from django.urls import path
from core.api import model_viewset
from .models import FeeReminder, FeeStructure, StudentFeeAccount
from .views import FeeActionViewSet, FeeInvoiceViewSet, FeeTransactionViewSet
from .serializers import FeeReminderSerializer, FeeStructureSerializer, StudentFeeAccountSerializer

router = SimpleRouter()
router.register("fees/transactions", FeeTransactionViewSet, basename="fees-transactions")
router.register("fees/invoices", FeeInvoiceViewSet, basename="fees-invoices")
router.register("fees/structures", model_viewset(FeeStructure, "fees.view", FeeStructureSerializer), basename="fee-structures")
router.register("fees/account-ledgers", model_viewset(StudentFeeAccount, "fees.view", StudentFeeAccountSerializer), basename="fee-accounts")
router.register("fees/reminders", model_viewset(FeeReminder, "fees.view", FeeReminderSerializer), basename="fee-reminders")
router.register("fees/accounts", FeeActionViewSet, basename="fees-actions")
urlpatterns = [
    path("fees/defaulters/", FeeActionViewSet.as_view({"get": "defaulters"}), name="fee-defaulters"),
    path("fees/send-reminders/", FeeActionViewSet.as_view({"post": "send_reminders"}), name="fee-send-reminders"),
] + router.urls
