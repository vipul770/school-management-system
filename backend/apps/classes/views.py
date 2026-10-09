from core.api import model_viewset
from .models import Classroom, TimetableEntry
from .serializers import ClassroomSerializer, TimetableEntrySerializer

ClassroomViewSet = model_viewset(Classroom, "classes.view", ClassroomSerializer)
TimetableEntryViewSet = model_viewset(TimetableEntry, "classes.view", TimetableEntrySerializer)
