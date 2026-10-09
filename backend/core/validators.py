from django.core.validators import RegexValidator

phone_validator = RegexValidator(r"^\+?[0-9 ()-]{7,20}$", "Enter a valid phone number.")
