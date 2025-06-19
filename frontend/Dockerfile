# --- STAGE 1: Build the React application ---
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
# This will now use the hardcoded URL from axiosInstance.js
RUN npm run build


# --- STAGE 2: Serve the application with Nginx ---
FROM nginx:1.25-alpine

# Copy the built static files
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]