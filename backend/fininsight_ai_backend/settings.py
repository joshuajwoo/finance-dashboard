from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import plaid
from plaid.api import plaid_api
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
import dj_database_url

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = []

# For production, read hosts from specific environment variables
BACKEND_HOST = os.getenv('BACKEND_HOST')
if BACKEND_HOST:
    ALLOWED_HOSTS.append(BACKEND_HOST)

HOST = os.getenv('FRONTEND_HOST')
if FRONTEND_HOST:
    ALLOWED_HOSTS.append(FRONTEND_HOST)

# For local development when DEBUG is True
if DEBUG:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1'])

INSTALLED_APPS = ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles', 'corsheaders', 'core', 'rest_framework', 'rest_framework_simplejwt']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', 'django.middleware.security.SecurityMiddleware', 'whitenoise.middleware.WhiteNoiseMiddleware', 'django.contrib.sessions.middleware.SessionMiddleware', 'django.middleware.common.CommonMiddleware', 'django.middleware.csrf.CsrfViewMiddleware', 'django.contrib.auth.middleware.AuthenticationMiddleware', 'django.contrib.messages.middleware.MessageMiddleware', 'django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'fininsight_ai_backend.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'fininsight_ai_backend.wsgi.application'
# In settings.py

# Replace your existing DATABASES dictionary with this one.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}
AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}, {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}, {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STORAGES = {"staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"}}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)}
SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), 'REFRESH_TOKEN_LIFETIME': timedelta(days=1), 'ALGORITHM': 'HS256', 'SIGNING_KEY': SECRET_KEY, 'AUTH_HEADER_TYPES': ('Bearer',), 'USER_ID_FIELD': 'id', 'USER_ID_CLAIM': 'user_id'}

CORS_ALLOWED_ORIGINS = [os.getenv('FRONTEND_ORIGIN_URL', 'http://localhost:3000')]
CORS_ALLOW_HEADERS = ['Authorization', 'Content-Type']

PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SANDBOX_SECRET = os.getenv('PLAID_SANDBOX_SECRET')
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
PLAID_PRODUCTS = [Products(p) for p in os.getenv('PLAID_PRODUCTS', 'transactions').split(',')]
PLAID_COUNTRY_CODES = [CountryCode(c) for c in os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')]

# Configure Plaid client
host = plaid.Environment.Sandbox
if PLAID_ENV == 'development':
    host = plaid.Environment.Development
if PLAID_ENV == 'production':
    host = plaid.Environment.Production

configuration = plaid.Configuration(
    host=host,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SANDBOX_SECRET,
    }
)

api_client = plaid.ApiClient(configuration)
PLAID_CLIENT = plaid_api.PlaidApi(api_client)