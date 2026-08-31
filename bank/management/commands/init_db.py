"""
Management command to initialize MongoDB collections and indexes
"""
from django.core.management.base import BaseCommand, CommandError
from bank.database import get_db
from bank.models import User, Account, Transaction


class Command(BaseCommand):
    help = 'Initialize MongoDB collections and indexes for Bank Management System'

    def handle(self, *args, **options):
        try:
            db = get_db()
            
            if db is None:
                raise CommandError('MongoDB connection failed. Please check your connection string.')
            
            # Create collections
            collections = ['users', 'accounts', 'transactions']
            
            self.stdout.write("Creating collections...")
            for collection_name in collections:
                if collection_name not in db.list_collection_names():
                    db.create_collection(collection_name)
                    self.stdout.write(self.style.SUCCESS(f"✓ Created collection: {collection_name}"))
                else:
                    self.stdout.write(f"✓ Collection already exists: {collection_name}")
            
            # Create indexes
            self.stdout.write("\nCreating indexes...")
            
            # Users indexes
            users_collection = db['users']
            users_collection.create_index([('email', 1)], unique=True)
            self.stdout.write(self.style.SUCCESS("✓ Created unique index on users.email"))
            
            users_collection.create_index([('role', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on users.role"))
            
            # Accounts indexes
            accounts_collection = db['accounts']
            accounts_collection.create_index([('account_number', 1)], unique=True)
            self.stdout.write(self.style.SUCCESS("✓ Created unique index on accounts.account_number"))
            
            accounts_collection.create_index([('user_id', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on accounts.user_id"))
            
            accounts_collection.create_index([('status', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on accounts.status"))
            
            # Transactions indexes
            transactions_collection = db['transactions']
            transactions_collection.create_index([('transaction_id', 1)], unique=True)
            self.stdout.write(self.style.SUCCESS("✓ Created unique index on transactions.transaction_id"))
            
            transactions_collection.create_index([('sender_account', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on transactions.sender_account"))
            
            transactions_collection.create_index([('receiver_account', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on transactions.receiver_account"))
            
            transactions_collection.create_index([('transaction_type', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on transactions.transaction_type"))
            
            transactions_collection.create_index([('status', 1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on transactions.status"))
            
            transactions_collection.create_index([('created_at', -1)])
            self.stdout.write(self.style.SUCCESS("✓ Created index on transactions.created_at"))
            
            # Create TTL index for session or temporary data (optional)
            # transactions_collection.create_index([('created_at', 1)], expireAfterSeconds=86400*90)
            
            self.stdout.write(self.style.SUCCESS("\n✅ MongoDB initialization completed successfully!"))
            
        except Exception as e:
            raise CommandError(f"Error initializing MongoDB: {str(e)}")
