"""
Management command to create sample data for testing
"""
from django.core.management.base import BaseCommand, CommandError
from bank.models import User, Account, Transaction


class Command(BaseCommand):
    help = 'Create sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all data before creating sample data',
        )

    def handle(self, *args, **options):
        try:
            from bank.database import get_db
            db = get_db()
            
            if db is None:
                raise CommandError('MongoDB connection failed.')
            
            # Clear existing data if requested
            if options['clear']:
                self.stdout.write("Clearing existing data...")
                db['users'].delete_many({})
                db['accounts'].delete_many({})
                db['transactions'].delete_many({})
                self.stdout.write(self.style.SUCCESS("✓ Data cleared"))
            
            # Create sample users
            self.stdout.write("\nCreating sample users...")
            
            sample_users = [
                ('John Doe', 'john@example.com', '9876543210', 'password123', 'customer'),
                ('Jane Smith', 'jane@example.com', '9876543211', 'password123', 'customer'),
                ('Admin User', 'admin@example.com', '9876543212', 'admin123', 'admin'),
                ('Bob Wilson', 'bob@example.com', '9876543213', 'password123', 'customer'),
            ]
            
            users_map = {}
            for name, email, phone, password, role in sample_users:
                try:
                    user_id = User.create_user(name, email, phone, password, role)
                    users_map[email] = user_id
                    self.stdout.write(self.style.SUCCESS(f"✓ Created user: {name} ({email})"))
                except ValueError as e:
                    self.stdout.write(f"⚠ User already exists: {name} ({email})")
                    # Try to get existing user
                    user = User.get_user_by_email(email)
                    if user:
                        users_map[email] = user['_id']
            
            # Create sample accounts
            self.stdout.write("\nCreating sample accounts...")
            
            accounts_map = {}
            for email, user_id in users_map.items():
                try:
                    # Savings account
                    savings_id = Account.create_account(str(user_id), 'Savings', initial_balance=50000)
                    savings = Account.get_account(str(savings_id))
                    accounts_map[savings['account_number']] = savings
                    self.stdout.write(self.style.SUCCESS(
                        f"✓ Created Savings account for {email}: {savings['account_number']}"
                    ))
                    
                    # Current account
                    current_id = Account.create_account(str(user_id), 'Current', initial_balance=100000)
                    current = Account.get_account(str(current_id))
                    accounts_map[current['account_number']] = current
                    self.stdout.write(self.style.SUCCESS(
                        f"✓ Created Current account for {email}: {current['account_number']}"
                    ))
                except ValueError as e:
                    self.stdout.write(f"⚠ Account creation skipped for {email}: {str(e)}")
            
            # Create sample transactions
            self.stdout.write("\nCreating sample transactions...")
            
            account_numbers = list(accounts_map.keys())
            if len(account_numbers) >= 2:
                # Deposit
                txn_id = Transaction.create_transaction(
                    sender_account=account_numbers[0],
                    receiver_account=account_numbers[0],
                    amount=10000,
                    transaction_type='Deposit',
                    description='Cash deposit at bank counter',
                    status='Completed'
                )
                self.stdout.write(self.style.SUCCESS(f"✓ Created Deposit transaction"))
                
                # Withdrawal
                txn_id = Transaction.create_transaction(
                    sender_account=account_numbers[0],
                    receiver_account=account_numbers[0],
                    amount=5000,
                    transaction_type='Withdrawal',
                    description='ATM withdrawal',
                    status='Completed'
                )
                self.stdout.write(self.style.SUCCESS(f"✓ Created Withdrawal transaction"))
                
                # Transfer
                if len(account_numbers) >= 2:
                    txn_id = Transaction.create_transaction(
                        sender_account=account_numbers[0],
                        receiver_account=account_numbers[1],
                        amount=15000,
                        transaction_type='Transfer',
                        description='Payment to Jane',
                        status='Completed'
                    )
                    self.stdout.write(self.style.SUCCESS(f"✓ Created Transfer transaction"))
            
            self.stdout.write(self.style.SUCCESS("\n✅ Sample data created successfully!"))
            
        except Exception as e:
            raise CommandError(f"Error creating sample data: {str(e)}")
