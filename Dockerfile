# Use official Node.js image for build
FROM node:20 AS builder
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile
COPY . .

EXPOSE 3017


CMD ["yarn", "dev", "--","--host", "0.0.0.0","--strictPort"]
