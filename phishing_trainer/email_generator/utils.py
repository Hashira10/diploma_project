import openai
from django.conf import settings
from openai import OpenAI


def generate_phishing_email(prompt):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert at crafting realistic phishing emails for cybersecurity awareness training."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
