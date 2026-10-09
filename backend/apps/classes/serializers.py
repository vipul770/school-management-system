from core.api import model_serializer
from .models import Classroom, TimetableEntry

ClassroomSerializer = model_serializer(Classroom)
TimetableEntrySerializer = model_serializer(TimetableEntry)
