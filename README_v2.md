# Bank Management System

A full-stack banking application built with Django (backend), React (frontend), MongoDB (database), and Material UI.

## 📊 Project Status

| Phase | Name | Status | Details |
|-------|------|--------|---------|
| 1 | Django Setup & DRF Configuration | ✅ Complete | REST API framework, JWT auth, CORS configured |
| 2 | MongoDB Models & Services | ✅ Complete | User, Account, Transaction models with business logic |
| 3 | Authentication Endpoints | 🔄 Next | JWT login/register/logout, profile management |
| 4 | Account Operations | ⏳ Planned | Create accounts, view details, manage settings |
| 5 | Transaction Operations | ⏳ Planned | Deposit, withdrawal, transfer operations |
| 6 | Account History | ⏳ Planned | Transaction history, filtering, pagination |
| 7 | Balance Transfers | ⏳ Planned | P2P transfers, balance checking |
| 8 | Transaction History | ⏳ Planned | Advanced filtering, analytics |
| 9 | Admin Dashboard | ⏳ Planned | User management, account blocking, statistics |
| 10+ | Frontend & Deployment | ⏳ Planned | React UI, Docker, Azure deployment |

## 🏗️ Architecture

### Backend Stack
- **Framework**: Django 5.2.5
- **API**: Django REST Framework 3.14.0
- **Database**: MongoDB (PyMongo 4.6.1)
- **Authentication**: JWT (djangorestframework-simplejwt 5.5.1)
- **Security**: PBKDF2 password hashing, role-based access control
- **Validation**: Custom validators for amounts, emails, account numbers

### Frontend Stack (Coming in Phase 10+)
- **Framework**: React 18+
- **UI Library**: Material UI
- **State Management**: Redux Toolkit
- **API Client**: Axios with JWT interceptors

### Database
- **Service**: MongoDB
- **Collections**: users, accounts, transactions
- **Connection**: PyMongo with connection pooling

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Python 3.8+
python --version

# MongoDB (local or cloud)
# Download: https://www.mongodb.com/try/download/community
# Or Atlas: https://www.mongodb.com/cloud/atlas
```

### 2. Setup Environment
```bash
# Clone repository
git clone <repository-url>
cd bankManagementSystem

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB connection
```

### 3. Initialize Database
```bash
# Create collections and indexes
python manage.py init_db

# Create sample test data (optional)
python manage.py create_sample_data
```

### 4. Run Development Server
```bash
python manage.py runserver
# Server runs at http://127.0.0.1:8000/
```

---

## 📋 API Documentation

### Authentication (Phase 3)
```
POST   /api/auth/register/          Register new user
POST   /api/auth/login/             Login (returns JWT token)
POST   /api/auth/logout/            Logout
GET    /api/auth/me/                Get current user
PUT    /api/auth/profile/           Update profile
PUT    /api/auth/change-password/   Change password
```

### Accounts (Phase 4+)
```
GET    /api/accounts/               List user accounts
POST   /api/accounts/               Create account
GET    /api/accounts/<id>/          Get account details
```

### Transactions (Phase 5+)
```
GET    /api/transactions/           List transactions
POST   /api/transactions/deposit/   Deposit money
POST   /api/transactions/withdraw/  Withdraw money
POST   /api/transactions/transfer/  Transfer funds
```

### Admin (Phase 9)
```
GET    /api/admin/users/            List all users
GET    /api/admin/accounts/         List all accounts
PUT    /api/admin/accounts/<id>/block/    Block account
```

---

## 📁 Project Structure

```
bankManagementSystem/
├── manage.py                          # Django CLI
├── requirements.txt                   # Dependencies
├── .env                              # Environment (not in git)
├── .env.example                      # Template
├── README.md                         # This file
├── PHASE_2_GUIDE.md                 # Phase 2 documentation
│
├── bankManagementSystem/             # Django project
│   ├── settings.py                   # Configuration
│   ├── urls.py                       # URL routing
│   ├── wsgi.py
│   └── asgi.py
│
└── bank/                            # Main app
    ├── models.py                     # MongoDB models
    ├── serializers.py                # DRF serializers
    ├── views.py                      # Views (Phase 3+)
    ├── urls.py                       # Routes
    ├── database.py                   # MongoDB connection
    │
    ├── services/
    │   └── banking.py                # Business logic
    │
    ├── utils/
    │   ├── jwt_handler.py            # JWT utilities
    │   ├── validators.py             # Validation
    │   └── responses.py              # Response formatting
    │
    └── management/
        └── commands/
            ├── init_db.py            # Database setup
            └── create_sample_data.py # Test data
```

---

## 🔧 Configuration

### Environment Variables (.env)
```
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# MongoDB
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=bank_management

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Database Collections

**users**
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

**accounts**
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "account_number": String (unique),
  "account_type": "Savings" | "Current",
  "balance": Number,
  "status": "Active" | "Blocked" | "Closed",
  "created_at": Date,
  "updated_at": Date
}
```

**transactions**
```javascript
{
  "_id": ObjectId,
  "transaction_id": String (unique),
  "sender_account": String,
  "receiver_account": String,
  "amount": Number,
  "transaction_type": "Deposit" | "Withdrawal" | "Transfer",
  "status": "Completed" | "Failed",
  "description": String,
  "created_at": Date
}
```

---

## 🔐 Security Features

✅ **Password Security**
- PBKDF2 hashing with salt
- 100,000 iterations
- Unique salt per password

✅ **Authentication**
- JWT tokens with expiration
- Role-based access control
- Account ownership verification

✅ **Data Validation**
- Email format validation
- Amount validation (positive only)
- Input sanitization

✅ **API Security**
- CORS configured
- HTTPS ready (production)
- Account ownership checks

---

## 🧪 Testing

### Database Connection
```bash
python -c "from bank.database import get_db; print('✓ Connected' if get_db() else 'Failed')"
```

### System Status
```bash
python manage.py check
```

### Sample Data
```bash
python manage.py create_sample_data --clear
```

---

## 🛠️ Development Workflow

1. **Work on one phase at a time**
2. **Test before proceeding**
3. **Follow PEP 8 style**
4. **Document complex logic**

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or on Windows
net start MongoDB
```

### Port Already in Use
```bash
python manage.py runserver 8001
```

### Missing Collections
```bash
python manage.py init_db
```

---

## 📚 Documentation

- [Phase 2 Guide](./PHASE_2_GUIDE.md) - Detailed setup and models
- Architecture: See project structure above
- API: Endpoints listed above

---

## 📝 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 5.2.5 | Web framework |
| djangorestframework | 3.14.0 | REST API |
| django-cors-headers | 4.3.1 | CORS support |
| PyMongo | 4.6.1 | MongoDB driver |
| djangorestframework-simplejwt | 5.5.1 | JWT auth |
| python-dotenv | 1.0.0 | Environment config |

---

## 🚀 Next Steps

### Phase 3: Authentication Endpoints
- [ ] User registration endpoint
- [ ] User login endpoint with JWT
- [ ] User logout endpoint
- [ ] User profile endpoints
- [ ] Password change endpoint

### Phase 4-8: Banking Operations
- [ ] Account management
- [ ] Transaction operations
- [ ] Transfer functionality
- [ ] History and filtering

### Phase 9: Admin Features
- [ ] Admin dashboard
- [ ] User management
- [ ] Account blocking

### Phase 10+: Frontend & Deployment
- [ ] React frontend
- [ ] Material UI components
- [ ] Docker containerization
- [ ] Azure deployment

---

## ✅ Completed Work

- [x] Phase 1: Django & REST Framework setup
- [x] Phase 2: MongoDB models and services
  - [x] User model with PBKDF2 password hashing
  - [x] Account model with status tracking
  - [x] Transaction model with full tracking
  - [x] Business logic services
  - [x] Management commands
  - [x] JWT authentication utilities
- [ ] Phase 3: Authentication API endpoints
- [ ] Phases 4-9: Banking operations
- [ ] Phase 10+: Frontend and deployment

---

## 📝 License

MIT License

---

**Current Phase**: Phase 3 - Building authentication endpoints

For detailed Phase 2 information, see [PHASE_2_GUIDE.md](./PHASE_2_GUIDE.md)
