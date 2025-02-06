from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SenderViewSet, RecipientGroupViewSet, RecipientViewSet

router = DefaultRouter()
router.register(r'senders', SenderViewSet)
router.register(r'recipient_groups', RecipientGroupViewSet)
router.register(r'recipients', RecipientViewSet)

urlpatterns = [
    path('api/', include(router.urls)),  # Для API-эндпоинтов
]
