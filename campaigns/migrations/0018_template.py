# Generated by Django 5.1.3 on 2025-03-03 04:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0017_credentiallog_message'),
    ]

    operations = [
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('file_path', models.CharField(max_length=255)),
            ],
        ),
    ]
