# ==========================================
# 1. Base Stage
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ==========================================
# 2. Development Stage (with HMR support)
# ==========================================
FROM base AS development
# Install all dependencies (including devDependencies)
RUN npm install
# Copy the source code
COPY . .
# Vite default dev server port
EXPOSE 5173
# Start Vite and expose it to the host network (0.0.0.0) so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==========================================
# 3. Build Stage for Production
# ==========================================
FROM base AS builder
# Install dependencies cleanly
RUN npm ci
COPY . .
# Build the production assets to /app/dist
RUN npm run build

# ==========================================
# 4. Production Serving Stage (Nginx)
# ==========================================
FROM nginx:alpine AS production
# Copy the build assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx configuration to handle React Router client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
