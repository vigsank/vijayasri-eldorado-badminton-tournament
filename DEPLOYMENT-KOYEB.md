# Koyeb Deployment Guide - Vijayasri Badminton Manager

This guide explains how to deploy the Badminton Manager application to **Koyeb** (free tier) with faster wake-up times than Render.

## Why Koyeb?

- **Faster wake-up time**: 5-10 seconds vs 30+ seconds on Render
- **Free tier includes**: 1 app, $5.50 monthly credit (enough for free hosting)
- **Auto-scaling**: Even on free tier
- **Global deployment**: Singapore region available (closest to India)
- **Better uptime**: Apps don't sleep as aggressively

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Koyeb account (free) - Sign up at https://www.koyeb.com

## Deployment Steps

### Option 1: Deploy via Koyeb Web Interface (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Koyeb deployment configuration"
   git push origin main
   ```

2. **Create a new app on Koyeb**
   - Go to https://app.koyeb.com
   - Click "Create App"
   - Select "GitHub" as deployment method
   - Authorize Koyeb to access your GitHub (if first time)

3. **Configure the deployment**
   - **Repository**: Select your `vijayasri-eldorado-badminton-tournament` repo
   - **Branch**: `main`
   - **Builder**: Buildpack
   - **Build command**: `npm install --production=false && npm run build`
   - **Run command**: `npm run start:prod`
   - **Port**: `3001`
   - **Instance type**: `free`
   - **Region**: `Singapore`

4. **Environment Variables**
   Add the following:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`

5. **Health check**
   - Path: `/api/data`
   - Port: `3001`

6. **Click "Deploy"**

### Option 2: Deploy via Koyeb CLI

1. **Install Koyeb CLI**
   ```bash
   # macOS
   brew install koyeb/tap/koyeb-cli
   
   # Or download from https://github.com/koyebinc/koyeb-cli/releases
   ```

2. **Login to Koyeb**
   ```bash
   koyeb login
   ```

3. **Deploy the app**
   ```bash
   koyeb app create vijayasri-badminton-manager \
     --git https://github.com/YOUR_USERNAME/vijayasri-eldorado-badminton-tournament \
     --git-branch main \
     --git-build-command "npm install --production=false && npm run build" \
     --git-run-command "npm run start:prod" \
     --ports 3001:http \
     --routes /:3001 \
     --env NODE_ENV=production \
     --env PORT=3001 \
     --instance-type free \
     --regions sin
   ```

### Option 3: Deploy using Dockerfile (Alternative)

If buildpack deployment fails, you can use Docker:

1. **Create a Dockerfile** (see Dockerfile in project root)

2. **Deploy via Koyeb web interface**
   - Select "Docker" as builder instead of "Buildpack"
   - Koyeb will automatically detect and use the Dockerfile

## Post-Deployment

### Your App URL
After deployment, your app will be available at:
```
https://vijayasri-badminton-manager-[YOUR_ORG].koyeb.app
```

### Monitoring
- View logs: https://app.koyeb.com → Your app → Logs
- View metrics: https://app.koyeb.com → Your app → Metrics
- Health status: Automatically monitored via health check endpoint

## Advantages over Render

1. **Faster cold starts**: 5-10 seconds vs 30+ seconds
2. **Better free tier**: $5.50/month credit (usually enough for one app)
3. **Auto-scaling**: Even on free tier
4. **Better uptime**: Less aggressive sleep policy
5. **Built-in metrics**: CPU, memory, and request monitoring

## Updating Your Deployment

Koyeb automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## Troubleshooting

### Build Fails
- Check build logs in Koyeb dashboard
- Ensure `npm install --production=false` is used (to install devDependencies)
- Try Docker deployment if buildpack fails

### App Crashes
- Check runtime logs
- Verify PORT environment variable matches your app
- Ensure health check endpoint `/api/data` is working

### Port Issues
- Koyeb requires you to specify the port explicitly
- Make sure your app listens on PORT 3001
- Update both env variables and port configuration

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `3001` | Port your app listens on |

## Custom Domain (Optional)

1. Go to your app settings
2. Click "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

## Support

For Koyeb-specific issues:
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Koyeb Community](https://community.koyeb.com)
- [Koyeb Status](https://status.koyeb.com)

## Comparison: Koyeb vs Render

| Feature | Koyeb | Render |
|---------|-------|--------|
| Cold start time | 5-10 seconds | 30+ seconds |
| Free tier | $5.50/month credit | 750 hours/month |
| Auto-scaling | Yes (even free) | No (free tier) |
| Sleep policy | Less aggressive | After 15 min |
| Regions | Multiple (incl. Singapore) | Limited on free |
| Metrics | Built-in | Basic logs only |
| WebSocket support | Yes | Yes |