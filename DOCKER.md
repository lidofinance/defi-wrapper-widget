# Docker & Nginx

This project builds a static Vite app in a multi-stage Docker build and serves it with Nginx.

## Prerequisites

- Docker Desktop (or Docker Engine) with Compose support

## Required environment variables

Create a `.env` file (see `.env.example`)

## Build and run

```bash
docker compose build --no-cache
docker compose up
```

If you change any `VITE_*` values, rebuild the image so Vite picks them up at build time.

## Nginx configuration

The container serves files from `/usr/share/nginx/html`.

The Nginx config is mounted at runtime from `nginx.conf` via `docker-compose.yml`:

```yaml
services:
  app:
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

This keeps Docker build cache stable when you edit Nginx config.

### Base path

This deployment is set up to **not** rely on `VITE_BASE_URL`. Nginx serves the app from `/` only, and unknown routes return `404` (no SPA fallback).

If you need to serve the widget under a sub-path (e.g. `/defi-wrapper-widget/`), update `nginx.conf` accordingly and keep `VITE_BASE_URL` empty. Do not set `VITE_BASE_URL` unless you also update asset paths in your Nginx config to match.

### Deploying to a remote server (minimal steps)

1. Copy the project to your server (or clone the repo).
2. Create `.env` with the required `VITE_*` values.
3. Build and run:

```bash
docker compose build --no-cache
docker compose up -d
```

4. Open port `3017` (or change the host port mapping in `docker-compose.yml`).
5. Point your domain or reverse proxy to `http://<server-ip>:3017/`.

### Notes

- `nginx.conf` only returns `index.html` for the root path `/`. Other unknown paths return `404`.
- Static assets are served directly by Nginx and cached.
