# Final, simplified frontend/Dockerfile

# STAGE 1: We no longer need a Node.js build stage.
# We will start directly from the Nginx image.
FROM nginx:1.25-alpine

# STAGE 2: Serve the application with Nginx

# Copy your locally-built 'build' folder into Nginx's web root directory.
# The 'build/' has a slash to copy its contents.
COPY build/ /usr/share/nginx/html

# Copy your Nginx configuration file.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 and start Nginx.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]