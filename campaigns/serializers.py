from rest_framework import serializers
from .models import Sender, RecipientGroup, Recipient, Message

class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sender
        fields = '__all__'

class RecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = ['id', 'first_name', 'last_name', 'email', 'position']

class RecipientGroupSerializer(serializers.ModelSerializer):
    recipients = RecipientSerializer(many=True)

    class Meta:
        model = RecipientGroup
        fields = ['id', 'name', 'recipients']

    def create(self, validated_data):
        recipients_data = validated_data.pop('recipients')
        group = RecipientGroup.objects.create(**validated_data)

        for recipient_data in recipients_data:
            recipient = Recipient.objects.create(**recipient_data)
            group.recipients.add(recipient)

        return group

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient_group', 'subject', 'body', 'link', 'sent_at']



