#!/bin/sh
set -e

echo "--- Applying database migrations... ---"
python manage.py migrate --no-input

echo "--- Starting Gunicorn server... ---"
# Use 'exec' to replace the shell process with the gunicorn process
exec gunicorn --bind 0.0.0.0:8000 fininsight_ai_backend.wsgi:application