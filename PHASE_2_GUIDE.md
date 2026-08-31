# Phase 2: MongoDB Configuration & Models - Complete Setup Guide

## Overview
Phase 2 establishes MongoDB as the database for the Bank Management System and creates all core data models with complete business logic.

---

## 🎯 What Was Accomplished

### 1. **MongoDB Models Created** ✅

#### **User Model** (`bank/models.py`)
- User registration and authentication
- Password hashing using PBKDF2
- Role-based access (customer, admin)
- User account management (activate, deactivate)

**Key Methods:**
- `create_user()` - Register new users
- `get_user()` - Retrieve by ID
- `get_user_by_email()` - Retrieve by email
- `verify_password()` - Authenticate user
- `hash_password()` - Secure password hashing
- `update_user()` - Update profile
- `get_all_users()` - Pagination support

#### **Account Model** (`bank/models.py`)
- Bank account management
- Support for Savings and Current accounts
- Account status tracking (Active, Blocked, Closed)
- Unique 10-digit account number generation
- Balance operations

**Key Methods:**
- `create_account()` - Create new bank account
- `get_account()` - Retrieve by ID
- `get_account_by_number()` - Retrieve by account number
- `get_user_accounts()` - Get all accounts for a user
- `update_balance()` - Increment/decrement balance
- `block_account()` - Block account
- `unblock_account()` - Unblock account
- `close_account()` - Close account
- Statistics: `count_accounts()`, `count_active_accounts()`, `count_blocked_accounts()`

#### **Transaction Model** (`bank/models.py`)
- Transaction recording and tracking
- Support for Deposit, Withdrawal, Transfer
- Transaction status tracking
- Unique transaction ID generation
- Query by account, type, status, date

**Key Methods:**
- `create_transaction()` - Create transaction record
- `get_account_transactions()` - Retrieve for an account
- `get_transactions_by_type()` - Filter by type
- `get_transactions_by_status()` - Filter by status
- `get_all_transactions()` - Paginated retrieval
- `get_total_transaction_volume()` - Analytics

### 2. **Serializers Created** ✅

Comprehensive serializers for API requests/responses:
- `UserSerializer` - User data representation
- `UserRegistrationSerializer` - Registration validation
- `UserLoginSerializer` - Login credentials
- `AccountSerializer` - Account representation
- `TransactionSerializer` - Transaction representation
- Filter serializers for advanced queries

### 3. **Business Logic Services** ✅

#### **AuthService** (`bank/services/banking.py`)
- `register_user()` - User registration with validation
- `login_user()` - Authentication
- `change_password()` - Password change

#### **AccountService** (`bank/services/banking.py`)
- `create_account()` - Create user accounts
- `get_user_accounts()` - Retrieve accounts
- `verify_account_ownership()` - Security checks
- `verify_account_active()` - Status validation

#### **TransactionService** (`bank/services/banking.py`)
- `deposit()` - Deposit operations
- `withdraw()` - Withdrawal operations
- `transfer()` - Money transfers
- `get_account_transactions()` - Transaction history
- `filter_transactions()` - Advanced filtering

#### **AdminService** (`bank/services/banking.py`)
- `get_all_users()` - Admin user view
- `get_all_accounts()` - Admin account view
- `get_dashboard_stats()` - Analytics
- `block_account()` - Account blocking
- `deactivate_user()` - User deactivation

### 4. **Database Configuration** ✅

#### **MongoDB Connection** (`bank/database.py`)
- Automatic MongoDB connection on startup
- Connection pooling
- Error handling with informative messages
- Support for `.env` configuration
- Collection and index utilities

#### **Management Commands** (`bank/management/commands/`)

**`init_db.py`** - Initialize database
```bash
python manage.py init_db
```
Creates collections and indexes automatically

**`create_sample_data.py`** - Create test data
```bash
python manage.py create_sample_data
python manage.py create_sample_data --clear  # Clear and recreate
```
Generates sample users, accounts, and transactions

### 5. **Authentication & Security** ✅

#### **JWT Handler** (`bank/utils/jwt_handler.py`)
- Token generation with expiration
- Token verification
- User extraction from token
- Configurable via environment

#### **Password Security**
- PBKDF2 hashing with salt
- 16-byte salt per password
- 100,000 iterations
- No plain-text storage

### 6. **Environment Configuration** ✅

Updated `.env` file:
```
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=bank_management
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION_HOURS=24
```

---

## 📊 MongoDB Collections Schema

### **users** Collection
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "phone": String,
  "password": String (hashed),
  "role": "customer" | "admin",
  "is_active": Boolean,
  "created_at": Date,
  "updated_at": Date
}
```

Indexes:
- `email` (unique)
- `role`

### **accounts** Collection
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "account_number": String (unique, 10 digits),
  "account_type": "Savings" | "Current",
  "balance": Number,
  "status": "Active" | "Blocked" | "Closed",
  "created_at": Date,
  "updated_at": Date
}
```

Indexes:
- `account_number` (unique)
- `user_id`
- `status`

### **transactions** Collection
```javascript
{
  "_id": ObjectId,
  "transaction_id": String (unique),
  "sender_account": String,
  "receiver_account": String,
  "amount": Number,
  "transaction_type": "Deposit" | "Withdrawal" | "Transfer",
  "status": "Pending" | "Completed" | "Failed",
  "description": String,
  "created_at": Date
}
```

Indexes:
- `transaction_id` (unique)
- `sender_account`
- `receiver_account`
- `transaction_type`
- `status`
- `created_at` (descending)

---

## 🚀 Testing Phase 2

### **Prerequisites:**
1. MongoDB must be running locally on `localhost:27017`
   
   **Windows:**
   ```bash
   # Start MongoDB (if using MongoDB Server)
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. Development server must be running:
   ```bash
   python manage.py runserver
   ```

### **Test 1: Initialize Database**
```bash
python manage.py init_db
```

Expected output:
```
Creating collections...
✓ Created collection: users
✓ Created collection: accounts
✓ Created collection: transactions
Creating indexes...
✓ Created unique index on users.email
✓ Created unique index on accounts.account_number
✓ Created unique index on transactions.transaction_id
... (more indexes)
✅ MongoDB initialization completed successfully!
```

### **Test 2: Create Sample Data**
```bash
python manage.py create_sample_data
```

Expected output:
```
Creating sample users...
✓ Created user: John Doe (john@example.com)
✓ Created user: Jane Smith (jane@example.com)
✓ Created user: Admin User (admin@example.com)
✓ Created user: Bob Wilson (bob@example.com)

Creating sample accounts...
✓ Created Savings account for john@example.com: 1234567890
✓ Created Current account for john@example.com: 0987654321
... (more accounts)

Creating sample transactions...
✓ Created Deposit transaction
✓ Created Withdrawal transaction
✓ Created Transfer transaction

✅ Sample data created successfully!
```

### **Test 3: Verify Connection**
```bash
python -c "from bank.models import User, Account, Transaction; from bank.database import get_db; print('✓ MongoDB connection OK' if get_db() else 'Connection failed')"
```

---

## 📁 Files Created in Phase 2

```
bank/
├── models.py                           # User, Account, Transaction models
├── serializers.py                      # API serializers
├── database.py                         # MongoDB connection
├── services/
│   ├── __init__.py
│   └── banking.py                      # Business logic services
├── utils/
│   ├── jwt_handler.py                  # JWT token management
│   ├── validators.py                   # Validation utilities
│   └── responses.py                    # API response utilities
├── management/
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       ├── init_db.py                  # Database initialization
│       └── create_sample_data.py       # Sample data generator
└── tests.py                            # Test cases
```

---

## 🔐 Security Features Implemented

✅ **Password Security:**
- PBKDF2 hashing with salt
- Never store plain text
- Verified on login

✅ **Data Validation:**
- Email format validation
- Amount validation (positive only)
- Account number format validation
- Role-based access

✅ **Transaction Safety:**
- Account ownership verification
- Balance checking before withdrawal
- Atomic balance updates
- Status tracking

✅ **User Management:**
- Account activation/deactivation
- Role differentiation (customer/admin)
- Profile update restrictions

---

## 📋 API Endpoints Ready (Phase 3+)

The models and services support these endpoints:

**Authentication:**
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user
- `PUT /api/auth/profile/` - Update profile
- `PUT /api/auth/change-password/` - Change password

**Accounts:**
- `GET /api/accounts/` - List user accounts
- `POST /api/accounts/` - Create account
- `GET /api/accounts/<id>/` - Get account details

**Banking Operations:**
- `POST /api/accounts/deposit/` - Deposit money
- `POST /api/accounts/withdraw/` - Withdraw money
- `POST /api/accounts/transfer/` - Transfer money

**Transactions:**
- `GET /api/transactions/` - List transactions
- `GET /api/transactions/<id>/` - Get transaction details

**Admin:**
- `GET /api/admin/users/` - List all users
- `GET /api/admin/accounts/` - List all accounts
- `GET /api/admin/transactions/` - List all transactions
- `PUT /api/admin/accounts/<id>/block/` - Block account
- `PUT /api/admin/accounts/<id>/unblock/` - Unblock account

---

## ✅ Phase 2 Verification Checklist

- [x] Models created (User, Account, Transaction)
- [x] Serializers created for all models
- [x] Business logic services implemented
- [x] MongoDB connection configured
- [x] Management commands created
- [x] Authentication utilities setup
- [x] Environment variables configured
- [x] Django system check passes

---

## 🎯 Next Steps: Phase 3

In Phase 3, we will:
1. Create API views and viewsets
2. Implement JWT authentication middleware
3. Create endpoints for registration, login, logout
4. Add profile management endpoints
5. Test all authentication flows

**Proceed to Phase 3 when ready!**
