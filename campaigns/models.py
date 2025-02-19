from django.db import models
from django.utils.timezone import now

class Sender(models.Model):
    smtp_host = models.CharField(max_length=255)
    smtp_port = models.IntegerField()
    smtp_username = models.CharField(max_length=255)
    smtp_password = models.CharField(max_length=255)

    def __str__(self):
        return self.smtp_username

class RecipientGroup(models.Model):
    name = models.CharField(max_length=255)
    recipients = models.ManyToManyField('Recipient')

    def __str__(self):
        return self.name

class Recipient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    position = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Message(models.Model):
    sender = models.ForeignKey(Sender, on_delete=models.CASCADE)
    recipient_group = models.ForeignKey(RecipientGroup, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    link = models.URLField(blank=True, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient_group}"


class ClickLog(models.Model):
    recipient = models.ForeignKey("Recipient", on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"Click from {self.ip_address} at {self.timestamp}"

class CredentialLog(models.Model):
    recipient = models.ForeignKey("Recipient", on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    password = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"Login attempt for {self.email} at {self.timestamp}"