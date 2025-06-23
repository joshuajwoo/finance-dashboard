#!/bin/sh
set -e

echo "--- Applying database migrations... ---"
python manage.py migrate --no-input

echo "--- Starting Gunicorn server... ---"
exec gunicorn --bind 0.0.0.0:8000 fininsight_ai_backend.wsgi:application