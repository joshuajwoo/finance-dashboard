# --- Build Stage ---
# 1. Use a Node.js image to build the React app
FROM node:20-alpine AS build

# 2. Set the working directory
WORKDIR /app

# 3. Copy package files and install dependencies
# This leverages Docker's layer caching
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# 4. Copy the rest of the application source code
COPY . .

# 5. Build the application for production
# The output will be in the /app/build directory
RUN npm run build


# --- Production Stage ---
# 1. Use a lightweight Nginx image to serve the built app
FROM nginx:stable-alpine

# 2. Copy the custom Nginx configuration
# This replaces the default Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy the built React app from the 'build' stage
# The files are copied to the default Nginx hosting directory
COPY --from=build /app/build /usr/share/nginx/html

# 4. Expose the port Nginx will run on
EXPOSE 80

# 5. The default command for the nginx image will start the server
# CMD ["nginx", "-g", "daemon off;"]