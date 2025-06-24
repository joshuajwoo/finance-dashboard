# frontend/Dockerfile

# --- Build Stage ---
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build

# --- Final Stage ---
FROM nginx:1.25-alpine

# Copy the built React app to Nginx's web server directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]