"""
Business logic services for banking operations
"""
from decimal import Decimal
from bank.models import User, Account, Transaction
from bank.database import get_collection
from bson import ObjectId


class AuthService:
    """Authentication service"""
    
    @staticmethod
    def register_user(name, email, phone, password, password_confirm):
        """Register a new user"""
        if password != password_confirm:
            raise ValueError("Passwords do not match")
        
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        
        try:
            user_id = User.create_user(name, email, phone, password, role='customer')
            return User.get_user(str(user_id))
        except ValueError as e:
            raise e
    
    @staticmethod
    def login_user(email, password):
        """Authenticate user"""
        user = User.get_user_by_email(email)
        
        if not user:
            raise ValueError("Invalid email or password")
        
        if not user.get('is_active'):
            raise ValueError("User account is deactivated")
        
        if not User.verify_password(user['password'], password):
            raise ValueError("Invalid email or password")
        
        return user
    
    @staticmethod
    def change_password(user_id, old_password, new_password, new_password_confirm):
        """Change user password"""
        if new_password != new_password_confirm:
            raise ValueError("New passwords do not match")
        
        if len(new_password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        
        user = User.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not User.verify_password(user['password'], old_password):
            raise ValueError("Old password is incorrect")
        
        new_password_hash = User.hash_password(new_password)
        User.update_user(user_id, password=new_password_hash)
        
        return {"message": "Password changed successfully"}


class AccountService:
    """Account management service"""
    
    @staticmethod
    def create_account(user_id, account_type):
        """Create a new bank account"""
        # Verify user exists
        user = User.get_user(user_id)
        if not user:
            raise ValueError("User not found")
        
        try:
            account_id = Account.create_account(user_id, account_type, initial_balance=0)
            return Account.get_account(str(account_id))
        except ValueError as e:
            raise e
    
    @staticmethod
    def get_user_accounts(user_id):
        """Get all accounts for a user"""
        accounts = Account.get_user_accounts(user_id)
        return accounts
    
    @staticmethod
    def get_account_by_number(account_number):
        """Get account details"""
        account = Account.get_account_by_number(account_number)
        if not account:
            raise ValueError("Account not found")
        return account
    
    @staticmethod
    def verify_account_ownership(user_id, account_number):
        """Verify that user owns the account"""
        account = Account.get_account_by_number(account_number)
        if not account:
            raise ValueError("Account not found")
        
        if str(account['user_id']) != str(user_id):
            raise ValueError("You do not have permission to access this account")
        
        return account
    
    @staticmethod
    def verify_account_active(account_number):
        """Verify account is active"""
        account = Account.get_account_by_number(account_number)
        if not account:
            raise ValueError("Account not found")
        
        if account['status'] != 'Active':
            raise ValueError(f"Account is {account['status'].lower()}")
        
        return account


class TransactionService:
    """Transaction processing service"""
    
    @staticmethod
    def deposit(account_number, amount, description):
        """Deposit money to account"""
        amount = Decimal(str(amount))
        
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
        
        account = TransactionService._get_and_verify_account(account_number)
        
        # Create transaction
        txn_id = Transaction.create_transaction(
            sender_account=account_number,
            receiver_account=account_number,
            amount=float(amount),
            transaction_type='Deposit',
            description=description,
            status='Completed'
        )
        
        # Update balance
        Account.update_balance(str(account['_id']), float(amount))
        
        # Get updated account
        updated_account = Account.get_account(str(account['_id']))
        
        return {
            'transaction_id': Transaction.get_transaction(str(txn_id))['transaction_id'],
            'account_number': account_number,
            'amount': str(amount),
            'new_balance': updated_account['balance'],
            'message': f'Deposit of ₹{amount} completed successfully'
        }
    
    @staticmethod
    def withdraw(user_id, account_number, amount, description):
        """Withdraw money from account"""
        amount = Decimal(str(amount))
        
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
        
        account = TransactionService._verify_ownership(user_id, account_number)
        
        if account['balance'] < float(amount):
            raise ValueError("Insufficient balance")
        
        # Create transaction
        txn_id = Transaction.create_transaction(
            sender_account=account_number,
            receiver_account=account_number,
            amount=float(amount),
            transaction_type='Withdrawal',
            description=description,
            status='Completed'
        )
        
        # Update balance
        Account.update_balance(str(account['_id']), -float(amount))
        
        # Get updated account
        updated_account = Account.get_account(str(account['_id']))
        
        return {
            'transaction_id': Transaction.get_transaction(str(txn_id))['transaction_id'],
            'account_number': account_number,
            'amount': str(amount),
            'new_balance': updated_account['balance'],
            'message': f'Withdrawal of ₹{amount} completed successfully'
        }
    
    @staticmethod
    def transfer(user_id, sender_account, receiver_account, amount, description):
        """Transfer money between accounts"""
        amount = Decimal(str(amount))
        
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
        
        # Verify sender owns the account
        sender = TransactionService._verify_ownership(user_id, sender_account)
        
        # Verify receiver account exists and is active
        receiver = TransactionService._get_and_verify_account(receiver_account)
        
        # Check if transferring to same account
        if sender_account == receiver_account:
            raise ValueError("Cannot transfer to the same account")
        
        # Check balance
        if sender['balance'] < float(amount):
            raise ValueError("Insufficient balance")
        
        # Create transaction
        txn_id = Transaction.create_transaction(
            sender_account=sender_account,
            receiver_account=receiver_account,
            amount=float(amount),
            transaction_type='Transfer',
            description=description,
            status='Completed'
        )
        
        # Update balances atomically
        Account.update_balance(str(sender['_id']), -float(amount))
        Account.update_balance(str(receiver['_id']), float(amount))
        
        # Get updated sender account
        updated_sender = Account.get_account(str(sender['_id']))
        
        return {
            'transaction_id': Transaction.get_transaction(str(txn_id))['transaction_id'],
            'from_account': sender_account,
            'to_account': receiver_account,
            'amount': str(amount),
            'sender_new_balance': updated_sender['balance'],
            'message': f'Transfer of ₹{amount} to {receiver_account} completed successfully'
        }
    
    @staticmethod
    def get_account_transactions(account_number, skip=0, limit=20):
        """Get transactions for an account"""
        # Verify account exists
        account = TransactionService._get_and_verify_account(account_number)
        
        transactions = Transaction.get_account_transactions(account_number, skip, limit)
        return transactions
    
    @staticmethod
    def get_all_transactions(skip=0, limit=20):
        """Get all transactions (admin only)"""
        return Transaction.get_all_transactions(skip, limit)
    
    @staticmethod
    def filter_transactions(**kwargs):
        """Filter transactions by criteria"""
        skip = kwargs.get('skip', 0)
        limit = kwargs.get('limit', 20)
        transaction_type = kwargs.get('transaction_type')
        status = kwargs.get('status')
        
        if transaction_type:
            return Transaction.get_transactions_by_type(transaction_type, skip, limit)
        elif status:
            return Transaction.get_transactions_by_status(status, skip, limit)
        else:
            return Transaction.get_all_transactions(skip, limit)
    
    @staticmethod
    def _get_and_verify_account(account_number):
        """Get and verify account is active"""
        account = Account.get_account_by_number(account_number)
        if not account:
            raise ValueError("Account not found")
        
        if account['status'] != 'Active':
            raise ValueError(f"Account is {account['status'].lower()}")
        
        return account
    
    @staticmethod
    def _verify_ownership(user_id, account_number):
        """Verify user owns the account and it's active"""
        account = TransactionService._get_and_verify_account(account_number)
        
        if str(account['user_id']) != str(user_id):
            raise ValueError("You do not have permission to access this account")
        
        return account


class AdminService:
    """Admin operations service"""
    
    @staticmethod
    def get_all_users(skip=0, limit=10):
        """Get all users (admin only)"""
        return User.get_all_users(skip, limit)
    
    @staticmethod
    def get_all_accounts(skip=0, limit=10):
        """Get all accounts (admin only)"""
        return Account.get_all_accounts(skip, limit)
    
    @staticmethod
    def get_dashboard_stats():
        """Get dashboard statistics (admin only)"""
        return {
            'total_users': User.count_users(),
            'total_accounts': Account.count_accounts(),
            'active_accounts': Account.count_active_accounts(),
            'blocked_accounts': Account.count_blocked_accounts(),
            'total_transactions': Transaction.count_transactions(),
            'total_volume': float(Transaction.get_total_transaction_volume()),
        }
    
    @staticmethod
    def block_account(account_id):
        """Block a customer account"""
        Account.block_account(account_id)
        return {"message": "Account blocked successfully"}
    
    @staticmethod
    def unblock_account(account_id):
        """Unblock a customer account"""
        Account.unblock_account(account_id)
        return {"message": "Account unblocked successfully"}
    
    @staticmethod
    def close_account(account_id):
        """Close a customer account"""
        Account.close_account(account_id)
        return {"message": "Account closed successfully"}
    
    @staticmethod
    def deactivate_user(user_id):
        """Deactivate a user"""
        User.deactivate_user(user_id)
        return {"message": "User deactivated successfully"}
    
    @staticmethod
    def activate_user(user_id):
        """Activate a user"""
        User.activate_user(user_id)
        return {"message": "User activated successfully"}
