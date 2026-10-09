from core.api import model_viewset
from .models import Announcement, Message
from .serializers import AnnouncementSerializer, MessageSerializer

MessageViewSet = model_viewset(Message, "communications.view", MessageSerializer)
AnnouncementViewSet = model_viewset(Announcement, "communications.view", AnnouncementSerializer)
