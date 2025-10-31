# Deployment Guide

This guide covers deploying the API server to various platforms.

## Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up** at [railway.app](https://railway.app)
2. **Create a new project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Configure:**
   - **Root Directory:** `cms`
   - **Start Command:** `npm run server`
   - **Port:** Railway sets this automatically
5. **Deploy!** You'll get a public URL like `https://your-app.railway.app`

**Your API URLs will be:**
- `https://your-app.railway.app/api/projects`
- `https://your-app.railway.app/api/filters`
- `https://your-app.railway.app/api/health`

---

### Option 2: Render

1. **Sign up** at [render.com](https://render.com)
2. **Create new Web Service** → Connect your GitHub repo
3. **Configure:**
   - **Root Directory:** `cms`
   - **Build Command:** (leave empty)
   - **Start Command:** `npm run server`
   - **Environment:** Node
4. **Deploy!**

---

### Option 3: Vercel (Serverless)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from the `cms` directory:**
   ```bash
   cd cms
   vercel
   ```

3. **Follow the prompts** and deploy!

Or connect your GitHub repo to Vercel dashboard and deploy automatically.

---

### Option 4: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create a `fly.toml` in the `cms` directory:**
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]

   [[services]]
     internal_port = 3000
     protocol = "tcp"
     
     [[services.ports]]
       port = 80
       handlers = ["http"]
     
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

3. **Deploy:**
   ```bash
   cd cms
   flyctl launch
   flyctl deploy
   ```

---

## Environment Variables

If you need to change Sanity configuration, set these environment variables:

- `SANITY_PROJECT_ID` (currently: `0c912k6j`)
- `SANITY_DATASET` (currently: `production`)

---

## Testing Your Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-deployment-url.com/api/health

# Get all projects
curl https://your-deployment-url.com/api/projects

# Get filters
curl https://your-deployment-url.com/api/filters
```

---

## CORS Configuration

The server is already configured with CORS enabled, so your frontend can access it from any domain.

