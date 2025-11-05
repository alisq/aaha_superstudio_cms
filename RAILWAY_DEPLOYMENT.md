# Railway Deployment Guide

This project is configured for easy deployment on Railway.

## Project Structure

- **Backend API**: Express server serving Sanity CMS API endpoints
- **Frontend**: React app served from the root path (`/`)
- **Studio**: Sanity Studio CMS served from `/studio`

## What's Configured

### 1. Railway Configuration (`railway.json`)
- Uses NIXPACKS builder
- Starts with `node server.js`
- Automatic restart on failure

### 2. Build Configuration (`nixpacks.toml`)
- Installs root dependencies and frontend dependencies
- Builds both Sanity Studio and React frontend
- Build order:
  1. `npm ci` (root dependencies)
  2. `cd frontend && npm ci` (frontend dependencies)
  3. `npm run build:studio` (builds Sanity Studio)
  4. `cd frontend && npm run build` (builds React app)

### 3. Server Configuration (`server.js`)
- Serves API at `/api/*` routes
- Serves Sanity Studio at `/studio` route
- Serves React frontend at root `/` and all other routes
- Proper route ordering ensures API and Studio routes work correctly

### 4. Frontend Configuration
- `frontend/src/config.js`: Uses environment variables for API URL
  - Development: Uses `http://localhost:3000`
  - Production: Uses relative URLs (same domain)
  - Can override with `REACT_APP_API_URL` environment variable

## Deployment Steps

### Option 1: Deploy via Railway Dashboard

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository

2. **Configure Environment Variables** (Optional)
   - If you need to override the API URL, set:
     - `REACT_APP_API_URL`: Custom API URL (defaults to relative URLs in production)

3. **Deploy**
   - Railway will automatically detect the `railway.json` and `nixpacks.toml`
   - The build process will:
     - Install all dependencies
     - Build Sanity Studio → `dist/`
     - Build React frontend → `frontend/build/`
     - Start the server

4. **Access Your App**
   - Frontend: `https://your-app.railway.app/`
   - API: `https://your-app.railway.app/api/*`
   - Studio: `https://your-app.railway.app/studio`

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Local Development

### Build Everything Locally

```bash
# Build both studio and frontend
npm run build:all

# Start server
npm run server
```

### Development Mode

```bash
# Terminal 1: Start backend API
npm run server

# Terminal 2: Start frontend dev server
cd frontend && npm start
```

## Routes

- `/` - React frontend (main app)
- `/api/filters` - Get filter options
- `/api/projects` - Get all projects
- `/api/health` - Health check
- `/studio` - Sanity Studio CMS
- `/studio/*` - Sanity Studio routes

## Environment Variables

### Railway Environment Variables

- `PORT`: Automatically set by Railway (defaults to 3000)
- `REACT_APP_API_URL`: (Optional) Override API URL for frontend

### Sanity Configuration

The Sanity client is configured in `server.js`:
- Project ID: `0c912k6j`
- Dataset: `production`
- API Version: `2024-01-01`

## Troubleshooting

### Frontend Not Loading
- Check if `frontend/build` directory exists
- Verify build completed successfully in Railway logs
- Check that `npm run build:frontend` completed

### API Not Working
- Verify API routes are defined before frontend catch-all in `server.js`
- Check Railway logs for errors
- Test `/api/health` endpoint

### Studio Not Loading
- Check if `dist` directory exists
- Verify `npm run build:studio` completed
- Check Railway logs for build errors

## Build Scripts

- `npm run build:studio` - Build Sanity Studio only
- `npm run build:frontend` - Build React frontend only
- `npm run build:all` - Build both studio and frontend
- `npm run server` - Start the Express server

## Notes

- The frontend uses relative URLs in production, so it works seamlessly with Railway's dynamic URLs
- All static assets (CSS, JS, images) are served correctly
- React Router will work correctly with the catch-all route configuration
- The server handles CORS for all routes

