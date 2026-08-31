"""
JWT Token utilities for authentication
"""
import jwt
from datetime import datetime, timedelta
from django.conf import settings
import os
from bson import ObjectId


JWT_SECRET = os.getenv('JWT_SECRET', settings.SECRET_KEY)
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))


def generate_token(user_id, role='customer'):
    """Generate JWT token for a user"""
    if isinstance(user_id, ObjectId):
        user_id = str(user_id)
    
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_from_token(token):
    """Extract user info from token"""
    payload = verify_token(token)
    if payload:
        return {
            'user_id': payload.get('user_id'),
            'role': payload.get('role')
        }
    return None
