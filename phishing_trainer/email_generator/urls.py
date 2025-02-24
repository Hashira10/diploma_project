from django.urls import path
from .views import generate_email_view

urlpatterns = [
    path('generate/', generate_email_view, name='generate_email'),
]
