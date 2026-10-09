from core.api import model_serializer
from .models import Exam, ExamResult, ExamTimetable, GradingScale, ReportCard

ExamSerializer = model_serializer(Exam)
ExamResultSerializer = model_serializer(ExamResult)
ExamTimetableSerializer = model_serializer(ExamTimetable)
GradingScaleSerializer = model_serializer(GradingScale)
ReportCardSerializer = model_serializer(ReportCard)
