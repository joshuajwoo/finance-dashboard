#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
# The --no-input flag is important for non-interactive environments
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Start Gunicorn server
# We bind to 0.0.0.0 to allow traffic from outside the container.
# The port is 8000, which we EXPOSE in the Dockerfile.
echo "Starting Gunicorn server with debug logging..."
gunicorn fininsight_ai_backend.wsgi:application --bind 0.0.0.0:8000 --log-level debug --log-file -