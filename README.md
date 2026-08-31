# Bank Management System

A full-stack banking application built with React.js frontend and Django REST Framework backend, using MongoDB as the database.

## Project Structure

```
bankManagementSystem/
├── bankManagementSystem/        # Django project settings
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── bank/                         # Main Django app
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── database.py
│   ├── utils/
│   │   ├── validators.py
│   │   └── responses.py
│   └── admin.py
├── frontend/                     # React.js frontend (Phase 10+)
├── manage.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions

### Phase 1: Django Backend Setup

#### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2. Verify Django Installation
```bash
python manage.py --version
```

Expected output: `5.2.5`

#### 3. Check Django Status
```bash
python manage.py check
```

This will verify that all apps are properly configured.

#### 4. Run Development Server
```bash
python manage.py runserver
```

The server should start at `http://127.0.0.1:8000/`

#### 5. Test Django Admin
Visit: `http://127.0.0.1:8000/admin/`

---

## Technology Stack

### Backend
- **Framework**: Django 5.2.5
- **API**: Django REST Framework 3.14.0
- **Database**: MongoDB 4.6.1
- **Authentication**: JWT (djangorestframework-simplejwt)
- **CORS**: django-cors-headers 4.3.1
- **Environment**: python-dotenv

### Frontend (Coming in Phase 10)
- React.js
- Material UI (MUI)
- Axios
- React Router

### Database
- MongoDB (MongoDB Atlas for production)

---

## Current Phase Progress

### ✅ Phase 1 Complete: Django Backend + Django REST Framework Setup
- Created Django project structure
- Installed Django REST Framework
- Configured CORS for frontend communication
- Set up environment variables
- Created bank app with modular structure
- Added validation utilities
- Added response formatting utilities

### 📋 Next Phase: MongoDB Configuration
We'll integrate MongoDB and create models for:
- Users (with authentication)
- Bank Accounts
- Transactions

---

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```
DEBUG=True
SECRET_KEY=your-secret-key
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=bank_management
JWT_SECRET=your-jwt-secret
```

---

## API Base URL

All API endpoints will be prefixed with `/api/`

Example: `http://127.0.0.1:8000/api/auth/login/`

---

## Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes
3. Test with: `python manage.py test`
4. Commit: `git commit -m "Add feature description"`
5. Push: `git push origin feature/feature-name`

---

## Notes

- **Do not commit `.env` file to Git** (it's in .gitignore)
- Keep sensitive credentials in `.env` file only
- Use the `.env.example` file as a template for other developers
- All passwords will be hashed using Django's built-in password hashing

---

## Contact & Support

For questions or issues, refer to the official documentation:
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
