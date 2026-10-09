from core.api import model_viewset
from .models import Exam, ExamResult, ExamTimetable, GradingScale, ReportCard
from .serializers import ExamResultSerializer, ExamSerializer, ExamTimetableSerializer, GradingScaleSerializer, ReportCardSerializer

ExamViewSet = model_viewset(Exam, "exams.view", ExamSerializer)
ExamTimetableViewSet = model_viewset(ExamTimetable, "exams.view", ExamTimetableSerializer)
ExamResultViewSet = model_viewset(ExamResult, "exams.view", ExamResultSerializer)
GradingScaleViewSet = model_viewset(GradingScale, "exams.view", GradingScaleSerializer)
ReportCardViewSet = model_viewset(ReportCard, "exams.view", ReportCardSerializer)
