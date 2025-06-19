from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

# Import our new custom view from its location in views.py
from core.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Use the custom view for the login endpoint
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/core/', include('core.urls')),
]