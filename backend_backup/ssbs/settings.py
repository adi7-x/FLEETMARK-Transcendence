# backend/ssbs/settings.py
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()  # must be called before any os.environ.get()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Vault Integration — secrets from HashiCorp Vault (fallback to env vars)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from ssbs.vault import get_secret

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = get_secret('django', 'secret_key', os.environ.get('SECRET_KEY'))
DEBUG = get_secret('django', 'debug', os.environ.get('DEBUG', 'False')) == 'True'
ALLOWED_HOSTS_ENV = get_secret('django', 'allowed_hosts', os.environ.get('ALLOWED_HOSTS', '*'))
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_ENV.split(',')] if ALLOWED_HOSTS_ENV != '*' else ['*']

AUTH_USER_MODEL = 'users.User'  # required — custom user model

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'apps.users',
    'apps.stations',
    'apps.buses',
    'apps.routes',
    'apps.drivers',
    'apps.trips',
    'apps.reservations',
    'apps.reports',
    'apps.notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ssbs.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ssbs.wsgi.application'

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Database — credentials from Vault, fallback to env vars
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': get_secret('database', 'name', os.environ.get('POSTGRES_DB')),
        'USER': get_secret('database', 'user', os.environ.get('POSTGRES_USER')),
        'PASSWORD': get_secret('database', 'password', os.environ.get('POSTGRES_PASSWORD')),
        'HOST': get_secret('database', 'host', os.environ.get('DB_HOST', 'db')),
        'PORT': get_secret('database', 'port', os.environ.get('DB_PORT', '5432')),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

USE_TZ = True
TIME_ZONE = 'Africa/Casablanca'

USE_I18N = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://localhost:8443',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    'EXCEPTION_HANDLER': 'apps.core.exception_handler.api_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ──────────────────────────────────────────────────────────────────────────────
# 42 Intra OAuth — credentials from Vault
# ──────────────────────────────────────────────────────────────────────────────
INTRA_42_CLIENT_ID = get_secret('oauth42', 'client_id', os.environ.get('INTRA_42_CLIENT_ID', ''))
INTRA_42_CLIENT_SECRET = get_secret('oauth42', 'client_secret', os.environ.get('INTRA_42_CLIENT_SECRET', ''))
INTRA_42_REDIRECT_URI = get_secret(
    'oauth42', 'redirect_uri',
    os.environ.get('INTRA_42_REDIRECT_URI', 'http://localhost:5173/auth/callback'),
)
ADMIN_42_LOGIN = get_secret('oauth42', 'admin_login', os.environ.get('ADMIN_42_LOGIN', ''))

# ──────────────────────────────────────────────────────────────────────────────
# Public API Key
# ──────────────────────────────────────────────────────────────────────────────
SSBS_API_KEY = get_secret('api', 'key', os.environ.get('SSBS_API_KEY', ''))

# ──────────────────────────────────────────────────────────────────────────────
# Security hardening (behind WAF/reverse proxy)
# ──────────────────────────────────────────────────────────────────────────────
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
