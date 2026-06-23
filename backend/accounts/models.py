# This app intentionally uses Django's built-in User model.
# Admin access is controlled via the `is_staff` flag on that model.
import random
import secrets
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


def generate_otp_code():
    return str(random.randint(1000, 9999))
def generate_reset_token():
    return secrets.token_urlsafe(32)


def default_signup_expiry():
    return timezone.now() + timedelta(minutes=10)


def default_reset_expiry():
    return timezone.now() + timedelta(minutes=30)


class PendingSignup(models.Model):
    """Holds signup details until the email OTP is verified."""
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    otp_code = models.CharField(max_length=4, default=generate_otp_code)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_signup_expiry)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Pending signup: {self.email}"


class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_codes')
    token = models.CharField(max_length=64, unique=True, default=generate_reset_token)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_reset_expiry)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self):
        return f"Reset token for {self.user}"