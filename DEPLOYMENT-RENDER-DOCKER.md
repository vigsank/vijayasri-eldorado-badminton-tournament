# Render Docker Deployment Guide - Vijayasri Badminton Manager

This guide explains how to deploy using Docker on Render, which solves the npm workspace and Rollup issues.

## Why Docker on Render?

- **Bypasses npm/Rollup issues**: No more platform binary errors
- **Consistent builds**: Same environment locally and in production
- **Better dependency management**: Handles complex npm workspace setups
- **Multi-stage builds**: Optimized image size

## What's Changed

The `render.yaml` is now configured to use Docker runtime instead of Node.js buildpack. This means Render will:
1. Build a Docker image using the `Dockerfile`
2. Deploy the containerized application
3. Handle all dependencies within the Docker build process

## Deployment Steps

### 1. Push Your Code

```bash
git add .
git commit -m "Switch to Docker deployment on Render"
git push origin main
```

### 2. Deploy on Render

**Option A: Automatic (Blueprint)**
- Go to https://render.com/deploy
- Connect your GitHub repository
- Render will detect the updated `render.yaml` with Docker runtime
- Click "Apply" to deploy

**Option B: Manual Update (if already deployed)**
- Go to your Render dashboard
- Select your service
- Go to Settings → Build & Deploy
- Change "Build Command" to Docker
- Save changes
- Trigger a manual deploy

### 3. Monitor the Build

Docker builds on Render typically show:
```
==> Building Docker image...
[+] Building 45.2s (18/18) FINISHED
 => [internal] load build definition from Dockerfile
 => [client-builder 1/7] FROM node:18-alpine
 => [client-builder 2/7] WORKDIR /app
 => [client-builder 3/7] COPY package*.json ./
 => [client-builder 4/7] RUN npm install --include=dev
 => [client-builder 5/7] COPY client/ ./client/
 => [client-builder 6/7] RUN npm run build
...
==> Pushing Docker image...
==> Deploying...
```

## How the Docker Build Works

1. **Stage 1: Build Client**
   - Uses Node.js 18 Alpine (lightweight)
   - Installs ALL dependencies (including dev)
   - Builds the React app with Vite
   - Avoids npm workspace issues by installing directly

2. **Stage 2: Production Image**
   - Fresh Node.js 18 Alpine image
   - Copies only production dependencies
   - Copies built client from Stage 1
   - Runs the Express server

## Dockerfile Details

```dockerfile
# Key improvements for Render:
- Installs client dependencies directly in /app/client
- Avoids npm workspace commands
- Uses multi-stage build for smaller image
- Sets PORT and NODE_ENV correctly
```

## Environment Variables

Already configured in `render.yaml`:
- `NODE_ENV=production`
- `PORT=3001`

## Troubleshooting Docker Builds

### Build Takes Too Long
- Normal for first build (5-10 minutes)
- Subsequent builds use cache (2-3 minutes)

### Out of Memory Errors
- Free tier has 512MB RAM limit during build
- Our multi-stage build optimizes memory usage

### Port Issues
- Dockerfile exposes port 3001
- Render maps this automatically

## Advantages Over Node.js Buildpack

1. **No Rollup Errors**: Docker handles all dependencies
2. **Reproducible**: Same build everywhere
3. **Cached Layers**: Faster rebuilds
4. **Isolated Environment**: No conflicts with Render's environment

## Testing Docker Locally (Optional)

If you have Docker installed:
```bash
# Build
docker build -t badminton-app .

# Run
docker run -p 3001:3001 badminton-app

# Access at http://localhost:3001
```

## Next Deployment

After this initial Docker setup, future deployments are automatic:
- Just push to GitHub
- Render rebuilds and deploys automatically
- No configuration changes needed

## Summary

By using Docker on Render, we've completely bypassed the npm workspace and Rollup platform binary issues. The deployment is now more reliable and consistent. Your app will be available at the same URL as before, but with a more robust build process.