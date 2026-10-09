from django.db import models
from core.models import TenantModel

class FeeInvoice(TenantModel):
    student = models.ForeignKey("students.Student", on_delete=models.PROTECT)
    academic_year = models.CharField(max_length=20, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=16, default="pending")

class FeeStructure(TenantModel):
    name = models.CharField(max_length=120)
    class_level = models.CharField(max_length=40, blank=True)
    academic_year = models.CharField(max_length=20)
    components = models.JSONField(default=list)

class StudentFeeAccount(TenantModel):
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    academic_year = models.CharField(max_length=20)
    total_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    class Meta:
        constraints = [models.UniqueConstraint(fields=("school", "student", "academic_year"), name="uniq_student_fee_year")]
    @property
    def balance(self):
        return self.total_due - self.total_paid

class FeeTransaction(TenantModel):
    invoice = models.ForeignKey("fees.FeeInvoice", null=True, blank=True, on_delete=models.PROTECT, related_name="transactions")
    student = models.ForeignKey("students.Student", on_delete=models.PROTECT, related_name="fee_transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_mode = models.CharField(max_length=20, default="cash")
    transaction_ref = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True, db_index=True)
    collected_by = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL)
    class Meta:
        indexes = [models.Index(fields=("school", "student", "paid_at"), name="fees_school_student_paid_idx")]

class FeeReminder(TenantModel):
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    due_date = models.DateField()
    sent_at = models.DateTimeField(null=True, blank=True)
    channel = models.CharField(max_length=12, default="email")
    status = models.CharField(max_length=16, default="queued")
