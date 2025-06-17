# backend/Dockerfile

# Use the official Python image
FROM python:3.12-slim

# Set environment variables for production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# --- START MODIFICATIONS ---

# Install system dependencies needed to build psycopg2 from source
# and to clean up the apt cache afterwards to keep the image small.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev build-essential postgresql-client curl \
    && rm -rf /var/lib/apt/lists/*

# --- END MODIFICATIONS ---

# Copy the requirements file and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Run collectstatic to gather all Django static files
RUN SECRET_KEY="dummy-key-for-build-only" DATABASE_URL="sqlite:///db.sqlite3" python manage.py collectstatic --no-input

# Expose the port Gunicorn will run on
EXPOSE 8000


RUN chmod +x /app/entrypoint.sh
# Run the entrypoint script to migrate the database and start Gunicorn
CMD ["/app/entrypoint.sh"]