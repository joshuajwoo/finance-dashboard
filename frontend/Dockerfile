# --- Build Stage ---
# This stage builds your React app into static files
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production Stage ---
# This stage creates the final, small container
FROM nginx:stable-alpine

# This line copies your Nginx configuration template.
# The Nginx container will use this to set the backend_url variable.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# This line copies your compiled React application (the HTML, CSS, and JS files)
# from the build stage into the Nginx web server directory.
# Without this line, your website would be empty.
COPY --from=build /app/build /usr/share/nginx/html

# This opens the port for the Nginx server.
EXPOSE 80