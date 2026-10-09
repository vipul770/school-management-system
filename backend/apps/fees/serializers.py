from core.api import model_serializer
from .models import FeeInvoice, FeeReminder, FeeStructure, FeeTransaction, StudentFeeAccount

FeeInvoiceSerializer = model_serializer(FeeInvoice)
FeeReminderSerializer = model_serializer(FeeReminder)
FeeStructureSerializer = model_serializer(FeeStructure)
FeeTransactionSerializer = model_serializer(FeeTransaction)
StudentFeeAccountSerializer = model_serializer(StudentFeeAccount)
