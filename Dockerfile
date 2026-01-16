# Stage 1: Build
FROM node:22-alpine3.20 AS builder

# Install compatibility libraries and common build tools if necessary
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

# Copy configuration files
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
# Using cache mount for faster builds with BuildKit
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
    yarn install --frozen-lockfile

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG NODE_ENV=production
# Add other VITE_ variables here if needed as ARGs

ENV NODE_ENV=$NODE_ENV

# Build the application
RUN yarn build

# Stage 2: Serve
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
