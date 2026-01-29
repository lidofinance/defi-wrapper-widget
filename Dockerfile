# Stage 1: Build
FROM node:22-alpine3.20 AS builder

# Install compatibility libraries and build tools for native deps
RUN apk add --no-cache libc6-compat python3 make g++

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
ARG VITE_OUT_DIR='./dist'
ARG VITE_POOL_TYPE
ARG VITE_POOL_ADDRESS
ARG VITE_STRATEGY_ADDRESS
ARG VITE_DEFAULT_REFERRAL_ADDRESS
ARG VITE_WIDGET_TITLE
ARG VITE_DEFAULT_CHAIN
ARG VITE_SUPPORTED_CHAINS
ARG VITE_PUBLIC_EL_RPC_URLS_1
ARG VITE_PUBLIC_EL_RPC_URLS_560048
ARG VITE_WALLETCONNECT_PROJECT_ID
ARG VITE_DEVNET_OVERRIDES
ARG VITE_LOCALE

ENV NODE_ENV=$NODE_ENV \
    VITE_OUT_DIR=$VITE_OUT_DIR\
    VITE_POOL_TYPE=$VITE_POOL_TYPE \
    VITE_POOL_ADDRESS=$VITE_POOL_ADDRESS \
    VITE_STRATEGY_ADDRESS=$VITE_STRATEGY_ADDRESS \
    VITE_DEFAULT_REFERRAL_ADDRESS=$VITE_DEFAULT_REFERRAL_ADDRESS \
    VITE_WIDGET_TITLE=$VITE_WIDGET_TITLE \
    VITE_DEFAULT_CHAIN=$VITE_DEFAULT_CHAIN \
    VITE_SUPPORTED_CHAINS=$VITE_SUPPORTED_CHAINS \
    VITE_PUBLIC_EL_RPC_URLS_1=$VITE_PUBLIC_EL_RPC_URLS_1 \
    VITE_PUBLIC_EL_RPC_URLS_560048=$VITE_PUBLIC_EL_RPC_URLS_560048 \
    VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID \
    VITE_DEVNET_OVERRIDES=$VITE_DEVNET_OVERRIDES \
    VITE_LOCALE=$VITE_LOCALE

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
