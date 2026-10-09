from core.api import TenantModelViewSet
from core.tasks import dispatch_task
from .models import ReportJob
from .tasks import generate_report
from .serializers import ReportJobSerializer

class ReportJobViewSet(TenantModelViewSet):
    queryset = ReportJob.all_objects.all()
    serializer_class = ReportJobSerializer
    required_permission = "reports.view"

    def perform_create(self, serializer):
        super().perform_create(serializer)
        dispatch_task(generate_report, str(serializer.instance.pk))
