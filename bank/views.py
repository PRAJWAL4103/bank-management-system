"""
Authentication API Views for Bank Management System
Handles user registration, login, logout, and profile management
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import make_password
from bson import ObjectId

from bank.models import User, Account
from bank.serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    CreateAccountSerializer,
    AccountSerializer
)
from bank.services.banking import AuthService, AccountService
from bank.utils.responses import success_response, error_response
from bank.utils.jwt_handler import generate_token, verify_token, get_user_from_token
from bank.database import get_collection


class UserRegistrationView(APIView):
    """
    User Registration Endpoint
    POST /api/auth/register/
    
    Request:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "password": "SecurePass123",
        "password_confirm": "SecurePass123"
    }
    
    Response:
    {
        "success": true,
        "message": "User registered successfully",
        "data": {
            "user_id": "...",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "customer"
        }
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Register a new user"""
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            
            if not serializer.is_valid():
                return error_response(
                    message="Validation failed",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Use AuthService to register user
            user = AuthService.register_user(
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                phone=serializer.validated_data.get('phone', ''),
                password=serializer.validated_data['password']
            )
            
            return success_response(
                message="User registered successfully",
                data={
                    'user_id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'phone': user.get('phone', ''),
                    'role': user['role']
                },
                status_code=status.HTTP_201_CREATED
            )
        
        except ValueError as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Registration failed",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserLoginView(APIView):
    """
    User Login Endpoint
    POST /api/auth/login/
    
    Request:
    {
        "email": "john@example.com",
        "password": "SecurePass123"
    }
    
    Response:
    {
        "success": true,
        "message": "Login successful",
        "data": {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "user": {
                "user_id": "...",
                "name": "John Doe",
                "email": "john@example.com",
                "role": "customer"
            }
        }
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Authenticate user and return JWT token"""
        try:
            serializer = UserLoginSerializer(data=request.data)
            
            if not serializer.is_valid():
                return error_response(
                    message="Validation failed",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Use AuthService to login user
            user = AuthService.login_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            
            # Generate JWT token
            token = generate_token(str(user['_id']), user['role'])
            
            return success_response(
                message="Login successful",
                data={
                    'token': token,
                    'user': {
                        'user_id': str(user['_id']),
                        'name': user['name'],
                        'email': user['email'],
                        'role': user['role'],
                        'phone': user.get('phone', '')
                    }
                },
                status_code=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return error_response(
                message="Login failed",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserLogoutView(APIView):
    """
    User Logout Endpoint
    POST /api/auth/logout/
    
    Note: Since we're using JWT, logout is handled client-side by removing the token.
    This endpoint can be used for server-side token blacklisting in future.
    
    Response:
    {
        "success": true,
        "message": "Logout successful",
        "data": {}
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Logout user (token invalidation handled client-side)"""
        try:
            # In future, this could implement token blacklisting
            # For now, just confirm logout
            return success_response(
                message="Logout successful",
                data={},
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Logout failed",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """
    Get Current User Profile
    GET /api/auth/me/
    
    Headers:
    Authorization: Bearer <token>
    
    Response:
    {
        "success": true,
        "message": "User profile retrieved",
        "data": {
            "user_id": "...",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "role": "customer",
            "is_active": true,
            "created_at": "2024-01-15T10:30:00Z"
        }
    }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user profile"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get user from database
            user = User.get_user(ObjectId(user_data['user_id']))
            
            if not user:
                return error_response(
                    message="User not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            serializer = UserSerializer(user)
            
            return success_response(
                message="User profile retrieved",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        
        except Exception as e:
            return error_response(
                message="Failed to retrieve profile",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileUpdateView(APIView):
    """
    Update User Profile
    PUT /api/auth/profile/
    
    Headers:
    Authorization: Bearer <token>
    
    Request:
    {
        "name": "Jane Doe",
        "phone": "+9876543210"
    }
    
    Response:
    {
        "success": true,
        "message": "Profile updated successfully",
        "data": {
            "user_id": "...",
            "name": "Jane Doe",
            "email": "john@example.com",
            "phone": "+9876543210",
            "role": "customer"
        }
    }
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update user profile (name and phone only)"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Validate input
            serializer = UserProfileUpdateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return error_response(
                    message="Validation failed",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Update user
            user = User.update_user(
                user_id=ObjectId(user_data['user_id']),
                name=serializer.validated_data.get('name'),
                phone=serializer.validated_data.get('phone')
            )
            
            if not user:
                return error_response(
                    message="User not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            user_serializer = UserSerializer(user)
            
            return success_response(
                message="Profile updated successfully",
                data=user_serializer.data,
                status_code=status.HTTP_200_OK
            )
        
        except Exception as e:
            return error_response(
                message="Failed to update profile",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView):
    """
    Change User Password
    PUT /api/auth/change-password/
    
    Headers:
    Authorization: Bearer <token>
    
    Request:
    {
        "old_password": "OldPassword123",
        "new_password": "NewPassword123",
        "new_password_confirm": "NewPassword123"
    }
    
    Response:
    {
        "success": true,
        "message": "Password changed successfully",
        "data": {}
    }
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Change user password"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Validate input
            serializer = ChangePasswordSerializer(data=request.data)
            
            if not serializer.is_valid():
                return error_response(
                    message="Validation failed",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Use AuthService to change password
            AuthService.change_password(
                user_id=ObjectId(user_data['user_id']),
                old_password=serializer.validated_data['old_password'],
                new_password=serializer.validated_data['new_password'],
                new_password_confirm=serializer.validated_data['new_password_confirm']
            )
            
            return success_response(
                message="Password changed successfully",
                data={},
                status_code=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Failed to change password",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================================
# ACCOUNT MANAGEMENT VIEWS (Phase 4)
# ============================================================================


class CreateAccountView(APIView):
    """
    Create a new bank account
    POST /api/accounts/
    
    Headers:
    Authorization: Bearer <token>
    
    Request:
    {
        "account_type": "Savings"  # "Savings" or "Checking"
    }
    
    Response:
    {
        "success": true,
        "message": "Account created successfully",
        "data": {
            "account_id": "...",
            "account_number": "1234567890",
            "account_type": "Savings",
            "balance": 0.00,
            "status": "Active",
            "created_at": "2024-01-15T10:30:00Z"
        }
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a new account for current user"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Validate input
            serializer = CreateAccountSerializer(data=request.data)
            
            if not serializer.is_valid():
                return error_response(
                    message="Validation failed",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Create account using AccountService
            account = AccountService.create_account(
                user_id=ObjectId(user_data['user_id']),
                account_type=serializer.validated_data['account_type']
            )
            
            account_serializer = AccountSerializer(account)
            
            return success_response(
                message="Account created successfully",
                data=account_serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        
        except ValueError as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Failed to create account",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ListAccountsView(APIView):
    """
    List all accounts for current user
    GET /api/accounts/
    
    Headers:
    Authorization: Bearer <token>
    
    Response:
    {
        "success": true,
        "message": "Accounts retrieved successfully",
        "data": [
            {
                "account_id": "...",
                "account_number": "1234567890",
                "account_type": "Savings",
                "balance": 5000.00,
                "status": "Active",
                "created_at": "2024-01-15T10:30:00Z"
            },
            ...
        ]
    }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all accounts for current user"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get user accounts
            accounts = AccountService.get_user_accounts(ObjectId(user_data['user_id']))
            
            serializer = AccountSerializer(accounts, many=True)
            
            return success_response(
                message="Accounts retrieved successfully",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        
        except Exception as e:
            return error_response(
                message="Failed to retrieve accounts",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AccountDetailView(APIView):
    """
    Get account details by account number
    GET /api/accounts/<account_number>/
    
    Headers:
    Authorization: Bearer <token>
    
    Response:
    {
        "success": true,
        "message": "Account retrieved successfully",
        "data": {
            "account_id": "...",
            "account_number": "1234567890",
            "account_type": "Savings",
            "balance": 5000.00,
            "status": "Active",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, account_number):
        """Get account details"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Verify account ownership
            account = AccountService.verify_account_ownership(
                ObjectId(user_data['user_id']),
                account_number
            )
            
            serializer = AccountSerializer(account)
            
            return success_response(
                message="Account retrieved successfully",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve account",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AccountStatusView(APIView):
    """
    Get account status
    GET /api/accounts/<account_number>/status/
    
    Headers:
    Authorization: Bearer <token>
    
    Response:
    {
        "success": true,
        "message": "Account status retrieved",
        "data": {
            "account_number": "1234567890",
            "status": "Active",
            "is_active": true,
            "balance": 5000.00
        }
    }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, account_number):
        """Get account status"""
        try:
            # Extract user from token
            token = request.auth
            user_data = get_user_from_token(str(token))
            
            if not user_data:
                return error_response(
                    message="Invalid or expired token",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Verify account ownership
            account = AccountService.verify_account_ownership(
                ObjectId(user_data['user_id']),
                account_number
            )
            
            return success_response(
                message="Account status retrieved",
                data={
                    'account_number': account['account_number'],
                    'status': account['status'],
                    'is_active': account['status'] == 'Active',
                    'balance': account['balance']
                },
                status_code=status.HTTP_200_OK
            )
        
        except ValueError as e:
            return error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve account status",
                errors={'error': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
