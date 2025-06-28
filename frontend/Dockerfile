# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# This line copies your compiled React application
COPY --from=build /app/build /usr/share/nginx/html

# This line copies our Nginx config with the placeholder
COPY nginx.conf /etc/nginx/nginx.conf

# This replaces the placeholder with the real address
RUN sed -i 's|__BACKEND_URL__|backend.local:8000|g' /etc/nginx/nginx.conf

# --- ADD THESE FINAL LINES ---

# Copy the entrypoint script
COPY entrypoint.sh /

# Make the entrypoint script executable (THIS IS THE FIX)
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]