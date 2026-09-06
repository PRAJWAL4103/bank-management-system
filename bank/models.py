"""
MongoDB Models for Bank Management System
Using PyMongo for direct MongoDB operations
"""
from datetime import datetime
from bson import ObjectId
from bank.database import get_collection
import re
import hashlib
import secrets
import string


class User:
    """User Model for MongoDB"""
    
    ROLE_CHOICES = ['customer', 'admin']
    
    @staticmethod
    def create_user(name, email, phone, password, role='customer'):
        """Create a new user in MongoDB"""
        collection = get_collection('users')
        
        # Check if user already exists
        if collection.find_one({'email': email}):
            raise ValueError("Email already registered")
        
        # Hash password
        password_hash = User.hash_password(password)
        
        user_doc = {
            'name': name,
            'email': email,
            'phone': phone,
            'password': password_hash,
            'role': role,
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        
        result = collection.insert_one(user_doc)
        return result.inserted_id
    
    @staticmethod
    def get_user(user_id):
        """Get user by ID"""
        collection = get_collection('users')
        user = collection.find_one({'_id': ObjectId(user_id)})
        return user
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        collection = get_collection('users')
        return collection.find_one({'email': email})
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify password"""
        # stored_password = salt_hex (32 chars) + hash_hex (64 chars)
        salt_hex = stored_password[:32]
        stored_hash = stored_password[32:]
        salt = bytes.fromhex(salt_hex)   # convert hex string back to bytes
        provided_hash = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt,
            100000
        )
        return provided_hash.hex() == stored_hash
    
    @staticmethod
    def hash_password(password):
        """Hash password using PBKDF2"""
        salt = secrets.token_bytes(16)
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            100000
        )
        return salt.hex() + password_hash.hex()
    
    @staticmethod
    def update_user(user_id, **kwargs):
        """Update user information"""
        collection = get_collection('users')
        update_data = {key: value for key, value in kwargs.items() if value is not None}
        update_data['updated_at'] = datetime.utcnow()
        
        result = collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def deactivate_user(user_id):
        """Deactivate user account"""
        return User.update_user(user_id, is_active=False)
    
    @staticmethod
    def activate_user(user_id):
        """Activate user account"""
        return User.update_user(user_id, is_active=True)
    
    @staticmethod
    def get_all_users(skip=0, limit=10):
        """Get all users with pagination"""
        collection = get_collection('users')
        return list(collection.find().skip(skip).limit(limit))
    
    @staticmethod
    def count_users():
        """Get total user count"""
        collection = get_collection('users')
        return collection.count_documents({})


class Account:
    """Bank Account Model for MongoDB"""
    
    ACCOUNT_TYPES = ['Savings', 'Current']
    ACCOUNT_STATUSES = ['Active', 'Blocked', 'Closed']
    
    @staticmethod
    def generate_account_number():
        """Generate unique 10-digit account number"""
        collection = get_collection('accounts')
        while True:
            account_number = ''.join(secrets.choice(string.digits) for _ in range(10))
            if not collection.find_one({'account_number': account_number}):
                return account_number
    
    @staticmethod
    def create_account(user_id, account_type='Savings', initial_balance=0):
        """Create a new bank account"""
        collection = get_collection('accounts')
        
        if account_type not in Account.ACCOUNT_TYPES:
            raise ValueError(f"Invalid account type. Must be one of {Account.ACCOUNT_TYPES}")
        
        # Check if user already has this account type
        existing = collection.find_one({
            'user_id': ObjectId(user_id),
            'account_type': account_type,
            'status': {'$ne': 'Closed'}
        })
        if existing:
            raise ValueError(f"User already has an active {account_type} account")
        
        account_doc = {
            'user_id': ObjectId(user_id),
            'account_number': Account.generate_account_number(),
            'account_type': account_type,
            'balance': float(initial_balance),
            'status': 'Active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        
        result = collection.insert_one(account_doc)
        return result.inserted_id
    
    @staticmethod
    def get_account(account_id):
        """Get account by ID"""
        collection = get_collection('accounts')
        return collection.find_one({'_id': ObjectId(account_id)})
    
    @staticmethod
    def get_account_by_number(account_number):
        """Get account by account number"""
        collection = get_collection('accounts')
        return collection.find_one({'account_number': account_number})
    
    @staticmethod
    def get_user_accounts(user_id):
        """Get all accounts for a user"""
        collection = get_collection('accounts')
        return list(collection.find({'user_id': ObjectId(user_id)}))
    
    @staticmethod
    def update_balance(account_id, amount):
        """Update account balance"""
        collection = get_collection('accounts')
        result = collection.update_one(
            {'_id': ObjectId(account_id)},
            {
                '$inc': {'balance': amount},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    @staticmethod
    def block_account(account_id):
        """Block an account"""
        collection = get_collection('accounts')
        collection.update_one(
            {'_id': ObjectId(account_id)},
            {'$set': {'status': 'Blocked', 'updated_at': datetime.utcnow()}}
        )
    
    @staticmethod
    def unblock_account(account_id):
        """Unblock an account"""
        collection = get_collection('accounts')
        collection.update_one(
            {'_id': ObjectId(account_id)},
            {'$set': {'status': 'Active', 'updated_at': datetime.utcnow()}}
        )
    
    @staticmethod
    def close_account(account_id):
        """Close an account"""
        collection = get_collection('accounts')
        collection.update_one(
            {'_id': ObjectId(account_id)},
            {'$set': {'status': 'Closed', 'updated_at': datetime.utcnow()}}
        )
    
    @staticmethod
    def get_all_accounts(skip=0, limit=10):
        """Get all accounts with pagination"""
        collection = get_collection('accounts')
        return list(collection.find().skip(skip).limit(limit))
    
    @staticmethod
    def count_accounts():
        """Get total account count"""
        collection = get_collection('accounts')
        return collection.count_documents({})
    
    @staticmethod
    def count_active_accounts():
        """Get count of active accounts"""
        collection = get_collection('accounts')
        return collection.count_documents({'status': 'Active'})
    
    @staticmethod
    def count_blocked_accounts():
        """Get count of blocked accounts"""
        collection = get_collection('accounts')
        return collection.count_documents({'status': 'Blocked'})


class Transaction:
    """Transaction Model for MongoDB"""
    
    TRANSACTION_TYPES = ['Deposit', 'Withdrawal', 'Transfer']
    TRANSACTION_STATUSES = ['Pending', 'Completed', 'Failed']
    
    @staticmethod
    def generate_transaction_id():
        """Generate unique transaction ID"""
        collection = get_collection('transactions')
        while True:
            # Format: TXN + timestamp + random string
            transaction_id = f"TXN{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(4).upper()}"
            if not collection.find_one({'transaction_id': transaction_id}):
                return transaction_id
    
    @staticmethod
    def create_transaction(sender_account, receiver_account, amount, transaction_type, description='', status='Completed'):
        """Create a new transaction"""
        collection = get_collection('transactions')
        
        if transaction_type not in Transaction.TRANSACTION_TYPES:
            raise ValueError(f"Invalid transaction type. Must be one of {Transaction.TRANSACTION_TYPES}")
        
        if status not in Transaction.TRANSACTION_STATUSES:
            raise ValueError(f"Invalid status. Must be one of {Transaction.TRANSACTION_STATUSES}")
        
        transaction_doc = {
            'transaction_id': Transaction.generate_transaction_id(),
            'sender_account': sender_account,
            'receiver_account': receiver_account,
            'amount': float(amount),
            'transaction_type': transaction_type,
            'status': status,
            'description': description,
            'created_at': datetime.utcnow(),
        }
        
        result = collection.insert_one(transaction_doc)
        return result.inserted_id
    
    @staticmethod
    def get_transaction(transaction_id):
        """Get transaction by ID"""
        collection = get_collection('transactions')
        return collection.find_one({'_id': ObjectId(transaction_id)})
    
    @staticmethod
    def get_transaction_by_txn_id(transaction_id):
        """Get transaction by transaction ID"""
        collection = get_collection('transactions')
        return collection.find_one({'transaction_id': transaction_id})
    
    @staticmethod
    def get_account_transactions(account_number, skip=0, limit=20):
        """Get all transactions for an account"""
        collection = get_collection('transactions')
        query = {
            '$or': [
                {'sender_account': account_number},
                {'receiver_account': account_number}
            ]
        }
        return list(collection.find(query).sort('created_at', -1).skip(skip).limit(limit))
    
    @staticmethod
    def get_transactions_by_type(transaction_type, skip=0, limit=20):
        """Get transactions by type"""
        collection = get_collection('transactions')
        return list(collection.find({'transaction_type': transaction_type}).sort('created_at', -1).skip(skip).limit(limit))
    
    @staticmethod
    def get_transactions_by_status(status, skip=0, limit=20):
        """Get transactions by status"""
        collection = get_collection('transactions')
        return list(collection.find({'status': status}).sort('created_at', -1).skip(skip).limit(limit))
    
    @staticmethod
    def get_all_transactions(skip=0, limit=20):
        """Get all transactions with pagination"""
        collection = get_collection('transactions')
        return list(collection.find().sort('created_at', -1).skip(skip).limit(limit))
    
    @staticmethod
    def count_transactions():
        """Get total transaction count"""
        collection = get_collection('transactions')
        return collection.count_documents({})
    
    @staticmethod
    def update_transaction_status(transaction_id, status):
        """Update transaction status"""
        collection = get_collection('transactions')
        result = collection.update_one(
            {'_id': ObjectId(transaction_id)},
            {'$set': {'status': status}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def get_total_transaction_volume():
        """Get total amount of all transactions"""
        collection = get_collection('transactions')
        result = collection.aggregate([
            {'$group': {'_id': None, 'total': {'$sum': '$amount'}}}
        ])
        data = list(result)
        return data[0]['total'] if data else 0
