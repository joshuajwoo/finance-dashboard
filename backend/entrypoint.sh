#!/bin/sh

set -e

# Temporarily disable migrations to test if the server can start
echo "Skipping database migrations for debugging..."
python manage.py migrate 

echo "Starting Gunicorn server..."
exec gunicorn fininsight_ai_backend.wsgi:application --bind 0.0.0.0:8000