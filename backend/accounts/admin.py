# Default Django User is already registered in the admin by django.contrib.auth.
from django.contrib import admin
from .models import PendingSignup, PasswordResetCode


@admin.register(PendingSignup)
class PendingSignupAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'otp_code', 'created_at', 'expires_at']


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'is_used']