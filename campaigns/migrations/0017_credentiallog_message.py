# Generated by Django 5.1.3 on 2025-03-02 11:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0016_message_recipients'),
    ]

    operations = [
        migrations.AddField(
            model_name='credentiallog',
            name='message',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='campaigns.message'),
        ),
    ]
