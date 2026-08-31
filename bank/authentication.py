"""
Custom JWT Authentication for DRF
Integrates our custom JWT handler with Django REST Framework
"""
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from bank.utils.jwt_handler import verify_token
import jwt


class CustomJWTAuthentication(TokenAuthentication):
    """
    Custom JWT authentication using our jwt_handler
    Extends DRF's TokenAuthentication for compatibility
    """
    keyword = 'Bearer'
    
    def authenticate(self, request):
        """Authenticate request using JWT token"""
        # Get the token from the Authorization header
        auth = request.META.get('HTTP_AUTHORIZATION', '').split()
        
        if not auth or auth[0].lower() != self.keyword.lower():
            return None  # No authentication header
        
        if len(auth) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')
        
        if len(auth) > 2:
            raise AuthenticationFailed('Invalid token header. Token string should not contain spaces.')
        
        token = auth[1]
        
        try:
            # Verify token using our JWT handler
            payload = verify_token(token)
            
            if payload is None:
                raise AuthenticationFailed('Invalid or expired token.')
            
            # Return (user, token) - we don't have a User object, so use payload
            # Store the token for later use
            class UserObj:
                def __init__(self, user_id, role):
                    self.user_id = user_id
                    self.role = role
                    self.is_authenticated = True
            
            user = UserObj(payload.get('user_id'), payload.get('role'))
            return (user, token)
        
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
