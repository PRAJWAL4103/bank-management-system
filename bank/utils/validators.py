"""
Helper functions for validation
"""
import re
from decimal import Decimal


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_amount(amount):
    """Validate transaction amount"""
    try:
        amount_decimal = Decimal(str(amount))
        return amount_decimal > 0
    except:
        return False


def validate_account_number(account_number):
    """Validate account number format"""
    return len(str(account_number)) == 10 and str(account_number).isdigit()


def format_currency(amount):
    """Format amount as currency"""
    return f"₹{amount:,.2f}"
