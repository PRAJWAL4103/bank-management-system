"""
Common API responses
"""
from rest_framework.response import Response
from rest_framework import status


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    """Return a success response"""
    return Response(
        {
            'success': True,
            'message': message,
            'data': data
        },
        status=status_code
    )


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Return an error response"""
    return Response(
        {
            'success': False,
            'message': message,
            'errors': errors
        },
        status=status_code
    )
