# Deployment Guide - Vijayasri Badminton Manager

This guide explains how to deploy the Badminton Manager application to **Render** (free tier).

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Render account (free) - Sign up at https://render.com

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy via Blueprint**
   - Go to https://render.com/deploy
   - Connect your GitHub account if not already connected
   - Select your repository
   - Render will automatically detect the `render.yaml` file and configure the service

3. **Wait for deployment**
   - Build takes approximately 2-5 minutes
   - Once deployed, you'll get a URL like: `https://vijayasri-badminton-manager.onrender.com`

### Option 2: Manual Deployment

1. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**
   - **Name**: `vijayasri-badminton-manager`
   - **Region**: Singapore (closest to India)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

3. **Add Environment Variables**
   - `NODE_ENV` = `production`

4. **Click "Create Web Service"**

## Post-Deployment

### Your App URL
After deployment, your app will be available at:
```
https://vijayasri-badminton-manager.onrender.com
```
(The exact URL depends on the name you chose)

### Free Tier Limitations
- **Sleep after inactivity**: The free tier spins down after 15 minutes of inactivity
- **Cold start**: First request after sleep takes ~30 seconds to wake up
- **750 hours/month**: Should be enough for a single service

### Keeping the App Awake (Optional)
If you want to prevent the app from sleeping:
1. Use a free service like [UptimeRobot](https://uptimerobot.com)
2. Set up a monitor to ping your app every 14 minutes

## Updating Your Deployment

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## Viewing Logs

1. Go to your Render dashboard
2. Click on your service
3. Click "Logs" in the left sidebar
4. View real-time logs including super-admin activity logs

## Troubleshooting

### Build Fails with npm/Rollup Error
If you encounter the Rollup platform binary error, Render now uses Docker deployment which bypasses this issue entirely. The `render.yaml` is configured to use Docker runtime.

### Build Fails (General)
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Docker build handles all dependency installation automatically

### App Crashes
- Check the runtime logs
- Ensure `NODE_ENV=production` is set
- Verify the start command is correct

### WebSocket Issues
- Render supports WebSockets on free tier
- The app is configured to work correctly with Socket.io

## Local Testing of Production Build

Before deploying, you can test the production build locally:

```bash
# Build the client
npm run build

# Start in production mode
npm run start:prod
```

Then open http://localhost:3001 in your browser.

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | (auto-set by Render) | Server port |

## Support

For issues with Render deployment, check:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)