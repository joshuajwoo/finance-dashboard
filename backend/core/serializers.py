from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Transaction
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    # Make email a required field for our API registration
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # Ensure email is included in the fields to be validated and used
        fields = ('id', 'username', 'email', 'password')

    def validate_email(self, value):
        """
        Check that the email is unique.
        """
        # Convert email to lowercase to ensure case-insensitive uniqueness
        email = value.lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return email

    def validate_username(self, value):
        """
        Check that the username is at least 5 characters long.
        """
        if len(value) < 5:
            raise serializers.ValidationError("Username must be at least 5 characters long.")
        return value

    def validate_password(self, value):
        """
        Check that the password is at least 8 characters long and contains at least one number.
        """
        password = value
        if len(password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'\d', password):
            raise serializers.ValidationError("Password must contain at least one number.")
        return password

    def create(self, validated_data):
        """
        Create and return a new user.
        """
        # Use the validated data to create the user
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for the Transaction model."""
    class Meta:
        model = Transaction
        fields = '__all__' # Include all fields from the Transaction model

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the token if you want
        # For example, you can add the username and email
        token['username'] = user.username
        token['email'] = user.email

        return token