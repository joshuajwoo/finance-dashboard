#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "Applying database migrations..."
python manage.py migrate --no-input

echo "Starting Gunicorn server..."
gunicorn --bind 0.0.0.0:8000 fininsight_ai_backend.wsgi:application