from rest_framework import serializers
from bank.models import User, Account, Transaction
from bson import ObjectId


class UserSerializer(serializers.Serializer):
    """Serializer for User model"""
    id = serializers.SerializerMethodField()
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    
    def get_id(self, obj):
        """Convert MongoDB ObjectId to string"""
        return str(obj.get('_id', ''))
    
    def create(self, validated_data):
        """Create a new user"""
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError("Password is required")
        
        user_id = User.create_user(
            name=validated_data.get('name'),
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            password=password,
            role=validated_data.get('role', 'customer')
        )
        return User.get_user(str(user_id))


class UserLoginSerializer(serializers.Serializer):
    """Serializer for login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration"""
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data


class UserProfileUpdateSerializer(serializers.Serializer):
    """Serializer for updating user profile"""
    name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=20, required=False)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match")
        return data


class AccountSerializer(serializers.Serializer):
    """Serializer for Account model"""
    id = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    account_number = serializers.CharField()
    account_type = serializers.ChoiceField(choices=Account.ACCOUNT_TYPES)
    balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    status = serializers.ChoiceField(choices=Account.ACCOUNT_STATUSES)
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    
    def get_id(self, obj):
        """Convert MongoDB ObjectId to string"""
        return str(obj.get('_id', ''))
    
    def get_user_id(self, obj):
        """Convert user_id ObjectId to string"""
        return str(obj.get('user_id', ''))
    
    def create(self, validated_data):
        """Create a new account"""
        user_id = self.context.get('user_id')
        if not user_id:
            raise serializers.ValidationError("User ID is required")
        
        account_id = Account.create_account(
            user_id=user_id,
            account_type=validated_data.get('account_type', 'Savings'),
            initial_balance=validated_data.get('balance', 0)
        )
        return Account.get_account(str(account_id))


class CreateAccountSerializer(serializers.Serializer):
    """Serializer for creating an account"""
    account_type = serializers.ChoiceField(choices=Account.ACCOUNT_TYPES)
    initial_balance = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=0)


class DepositSerializer(serializers.Serializer):
    """Serializer for deposit operation"""
    account_number = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, default='Deposit')


class WithdrawSerializer(serializers.Serializer):
    """Serializer for withdrawal operation"""
    account_number = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, default='Withdrawal')


class TransferSerializer(serializers.Serializer):
    """Serializer for transfer operation"""
    receiver_account = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, default='Transfer')


class TransactionSerializer(serializers.Serializer):
    """Serializer for Transaction model"""
    id = serializers.SerializerMethodField()
    transaction_id = serializers.CharField()
    sender_account = serializers.CharField()
    receiver_account = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = serializers.ChoiceField(choices=Transaction.TRANSACTION_TYPES)
    status = serializers.ChoiceField(choices=Transaction.TRANSACTION_STATUSES)
    description = serializers.CharField()
    created_at = serializers.DateTimeField()
    
    def get_id(self, obj):
        """Convert MongoDB ObjectId to string"""
        return str(obj.get('_id', ''))


class TransactionFilterSerializer(serializers.Serializer):
    """Serializer for filtering transactions"""
    transaction_type = serializers.ChoiceField(
        choices=Transaction.TRANSACTION_TYPES,
        required=False
    )
    status = serializers.ChoiceField(
        choices=Transaction.TRANSACTION_STATUSES,
        required=False
    )
    page = serializers.IntegerField(required=False, default=1, min_value=1)
    page_size = serializers.IntegerField(required=False, default=20, min_value=1)
