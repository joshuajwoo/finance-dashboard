# frontend/Dockerfile

# --- STAGE 1: Build the React application ---
# Use an official Node.js image as the base for building
FROM node:18-alpine AS build

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build


# --- STAGE 2: Serve the application with Nginx ---
# Use a lightweight Nginx image as the final base
FROM nginx:1.25-alpine

# Copy the built static files from the 'build' stage to Nginx's web root directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, which is the default port Nginx listens on
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]