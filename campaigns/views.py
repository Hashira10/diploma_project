from rest_framework import viewsets
from .models import Sender, RecipientGroup, Recipient
from .serializers import SenderSerializer, RecipientGroupSerializer, RecipientSerializer

class SenderViewSet(viewsets.ModelViewSet):
    queryset = Sender.objects.all()
    serializer_class = SenderSerializer

class RecipientGroupViewSet(viewsets.ModelViewSet):
    queryset = RecipientGroup.objects.all()
    serializer_class = RecipientGroupSerializer

class RecipientViewSet(viewsets.ModelViewSet):
    queryset = Recipient.objects.all()
    serializer_class = RecipientSerializer
