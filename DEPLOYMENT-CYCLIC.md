# Cyclic Deployment Guide - Vijayasri Badminton Manager

This guide explains how to deploy the Badminton Manager application to **Cyclic** - a 100% free platform with NO credit card required.

## Why Cyclic?

- **100% Free**: No credit card required, ever
- **Automatic HTTPS**: SSL certificates included
- **GitHub Integration**: Auto-deploy on push
- **Generous Limits**: 100,000 requests/month free
- **WebSocket Support**: Via Socket.io polling fallback
- **Fast Deployment**: Usually under 2 minutes
- **No Sleep**: Apps don't sleep like on Render

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Cyclic account (free) - Sign up at https://www.cyclic.sh

## Pre-Deployment Setup

Since Cyclic has some specific requirements, we need to make a small adjustment:

1. **Update package.json** to handle the build process:
   ```json
   "scripts": {
     ...
     "build": "cd client && npm install && npm run build && cd ..",
     "start:prod": "node server/index.js"
   }
   ```

## Deployment Steps

### Step 1: Sign up for Cyclic
1. Go to https://www.cyclic.sh
2. Click "Sign up" 
3. Use your GitHub account to sign up (recommended)
4. No credit card required!

### Step 2: Deploy Your App

1. **Connect your repository**
   - Click "Deploy" or "Link Your Own"
   - Authorize Cyclic to access your GitHub
   - Select your repository: `vijayasri-eldorado-badminton-tournament`
   - Select the branch: `main`

2. **Cyclic will automatically:**
   - Detect it's a Node.js app
   - Install dependencies
   - Run the build process
   - Deploy your app

3. **Configure Environment Variables**
   - Go to your app dashboard
   - Click "Variables" tab
   - Add:
     - `NODE_ENV` = `production`
     - `PORT` = `3001` (optional, Cyclic sets this automatically)

4. **Wait for deployment**
   - Usually takes 1-2 minutes
   - You'll see build logs in real-time

### Step 3: Access Your App

Your app will be available at:
```
https://[your-app-name].cyclic.app
```

The exact URL will be shown in your Cyclic dashboard.

## Important Notes for Cyclic

### WebSocket Limitations
- Cyclic doesn't support persistent WebSocket connections
- Socket.io will automatically fallback to HTTP long-polling
- This still provides real-time updates, just with slightly higher latency
- Perfect for your badminton tournament app's needs

### File System
- Cyclic has a read-only file system
- Your `tournament.json` data file works fine as it's included in the deployment
- Any file writes need to use Cyclic's S3 storage (not needed for this app)

## Post-Deployment

### Monitoring
- View logs: Dashboard → Logs
- See metrics: Dashboard → Analytics
- Monitor errors: Dashboard → Errors

### Custom Domain (Optional)
1. Go to Dashboard → Settings
2. Add your custom domain
3. Update DNS records as instructed
4. Free SSL certificate included

## Updating Your App

Cyclic automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Deployment typically completes in under 2 minutes.

## Troubleshooting

### Build Fails
1. Check build logs in the dashboard
2. Ensure all dependencies are in package.json
3. Try the build command locally first

### App Not Starting
1. Check runtime logs
2. Verify `server/index.js` exists
3. Ensure PORT environment variable is used

### Socket.io Issues
- Remember: WebSockets fallback to polling on Cyclic
- This is automatic - no code changes needed
- May see slightly higher latency but still real-time

## Cyclic Advantages

1. **No Credit Card**: Truly free, no hidden costs
2. **No Sleep**: Unlike Render/Heroku free tiers
3. **Generous Limits**: 100k requests/month
4. **Fast**: Global CDN included
5. **Simple**: Minimal configuration needed

## Alternative Build Approach

If the standard deployment fails, try this:

1. Fork the repository
2. Modify `package.json` in your fork:
   ```json
   "scripts": {
     "build": "npm install --prefix client && npm run build --prefix client",
     "start": "node server/index.js"
   }
   ```
3. Deploy from your fork

## Support

- [Cyclic Documentation](https://docs.cyclic.sh)
- [Cyclic Discord](https://discord.gg/cyclic)
- [Status Page](https://status.cyclic.sh)

## Summary

Cyclic provides a truly free, no-credit-card hosting solution perfect for your badminton tournament app. While it uses polling instead of WebSockets, this works great for your use case and provides reliable real-time updates without the cold start issues of other free platforms.