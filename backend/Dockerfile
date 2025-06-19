# --- STAGE 1: Build Stage ---
FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y build-essential libpq-dev

WORKDIR /app

COPY requirements.txt .
# Create a wheelhouse for faster installation in the next stage
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt


# --- STAGE 2: Final Stage ---
FROM python:3.12-slim

# Create a non-root user for better security
RUN useradd --create-home appuser
WORKDIR /home/appuser

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install only necessary runtime system dependencies
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy pre-built wheels from the builder stage and install them
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy the application code into the container and set ownership
COPY --chown=appuser:appuser . .

# Switch to the non-root user
USER appuser