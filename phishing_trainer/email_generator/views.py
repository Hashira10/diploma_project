from django.http import JsonResponse
from .utils import generate_phishing_email

def generate_email_view(request):
    prompt = "Generate a phishing email for training purposes."
    phishing_email = generate_phishing_email(prompt)
    return JsonResponse(
        {"phishing_email": phishing_email},
        json_dumps_params={"indent": 4}  # ✅ Pretty print JSON
    )

