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

# This line copies your compiled React app into the web server directory.
COPY --from=build /app/build /usr/share/nginx/html

# This is the corrected line.
# It copies your template file to the correct directory for processing.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80