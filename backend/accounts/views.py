from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PendingSignup, PasswordResetCode, generate_otp_code
from .serializers import (
    RegisterSerializer, UserSerializer, MyTokenObtainPairSerializer,
    SignupRequestOTPSerializer, SignupVerifyOTPSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


def issue_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    }


class SignupRequestOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupRequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        PendingSignup.objects.filter(email__iexact=data['email']).delete()
        otp_code = generate_otp_code()
        PendingSignup.objects.create(
            username=data['username'],
            email=data['email'],
            password_hash=make_password(data['password']),
            otp_code=otp_code,
        )

        send_mail(
            subject='Your verification code',
            message=f'Your verification code is: {otp_code}\nThis code expires in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[data['email']],
            fail_silently=False,
        )

        return Response({'detail': 'A verification code has been sent to your email.'})


class SignupVerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupVerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            pending = PendingSignup.objects.get(email__iexact=email)
        except PendingSignup.DoesNotExist:
            return Response({'detail': 'No pending signup found for this email.'}, status=status.HTTP_400_BAD_REQUEST)

        if pending.is_expired():
            pending.delete()
            return Response({'detail': 'This code has expired. Please sign up again.'}, status=status.HTTP_400_BAD_REQUEST)

        if pending.otp_code != otp:
            return Response({'detail': 'Incorrect verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(username=pending.username, email=pending.email, password=pending.password_hash)
        pending.delete()

        return Response(issue_tokens_for_user(user), status=status.HTTP_201_CREATED)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email__iexact=email).first()
        if user:
            PasswordResetCode.objects.filter(user=user).delete()
            reset_code = PasswordResetCode.objects.create(user=user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?email={email}&token={reset_code.token}"
            send_mail(
                subject='Reset your password',
                message=f'Click the link below to reset your password:\n{reset_link}\nThis link expires in 30 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        # Same response whether or not the email exists, so we don't leak who has an account
        return Response({'detail': 'If an account exists for this email, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            reset_code = PasswordResetCode.objects.get(token=data['token'], user__email__iexact=data['email'])
        except PasswordResetCode.DoesNotExist:
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_code.is_valid():
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_code.user
        user.set_password(data['new_password'])
        user.save()
        reset_code.is_used = True
        reset_code.save()

        return Response({'detail': 'Password reset successful. You can now log in.'})