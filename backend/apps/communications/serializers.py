from core.api import model_serializer
from .models import Announcement, Message

AnnouncementSerializer = model_serializer(Announcement)
MessageSerializer = model_serializer(Message)
