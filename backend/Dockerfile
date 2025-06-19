# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables to prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Add networking tools for debugging (from our previous step)
RUN apt-get update && apt-get install -y postgresql-client iputils-ping netcat-openbsd

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies first to leverage Docker's layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- START: Explicitly copy scripts and make them executable ---
# This ensures your scripts are in the container and can be run.
COPY ./entrypoint.sh /app/entrypoint.sh
COPY ./debug.sh /app/debug.sh
RUN chmod +x /app/entrypoint.sh
RUN chmod +x /app/debug.sh
# --- END: Explicitly copy scripts ---

# Copy the rest of your application code into the container
COPY . .

# NOTE: We are NOT using a CMD or ENTRYPOINT instruction here because
# we are providing the start command in the App Runner console.