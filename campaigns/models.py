from django.db import models

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
