# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables for production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies for psycopg2 and networking tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    postgresql-client \
    iputils-ping \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code into the container
COPY . .

# Run collectstatic to gather all Django static files for WhiteNoise
# We provide dummy secrets here just so the command can run during the build.
RUN SECRET_KEY="dummy-key-for-build" DATABASE_URL="sqlite:///db.sqlite3" python manage.py collectstatic --no-input

# Expose the port that Gunicorn will listen on
EXPOSE 8000

# Set our script as the main entrypoint. It will always run first.
ENTRYPOINT ["/app/entrypoint.sh"]

# Set the default command that the entrypoint will execute after migrations.
# This starts the production web server.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "fininsight_ai_backend.wsgi:application"]