from django.urls import path
from .views import UserCreateView, ProtectedDataView, CreateLinkTokenView, SetAccessTokenView, TransactionsView #, HelloView
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend is running!"})

urlpatterns = [
    path('', health_check, name='health-check'),
    path('register/', UserCreateView.as_view(), name='user_register'),
    path('protected-data/', ProtectedDataView.as_view(), name='protected_data'),
    # path('hello/', HelloView.as_view(), name='hello_view'),
    path('create-link-token/', CreateLinkTokenView.as_view(), name='create_link_token'),
    path('set-access-token/', SetAccessTokenView.as_view(), name='set_access_token'),
    path('transactions/', TransactionsView.as_view(), name='get_transactions'),
]