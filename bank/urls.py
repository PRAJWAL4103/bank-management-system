from django.urls import path
from bank.views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    UserProfileUpdateView,
    ChangePasswordView,
    CreateAccountView,
    ListAccountsView,
    AccountDetailView,
    AccountStatusView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', UserLogoutView.as_view(), name='user-logout'),
    path('auth/me/', UserProfileView.as_view(), name='user-profile'),
    path('auth/profile/', UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Account management endpoints
    path('accounts/', CreateAccountView.as_view(), name='create-account'),  # POST
    path('accounts/list/', ListAccountsView.as_view(), name='list-accounts'),  # GET
    path('accounts/<str:account_number>/', AccountDetailView.as_view(), name='account-detail'),  # GET
    path('accounts/<str:account_number>/status/', AccountStatusView.as_view(), name='account-status'),  # GET
]
