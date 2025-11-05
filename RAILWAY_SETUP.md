# Railway Monorepo Deployment Guide

This guide explains how to deploy both the backend API and frontend React app as separate services on Railway.

## Architecture

- **Backend Service**: Express API server (root directory)
- **Frontend Service**: React app (`/frontend` directory)

## Setup Instructions

### Step 1: Create Backend Service

1. Go to [Railway Dashboard](https://railway.app)
2. Create a new project (or use existing)
3. Click **"New"** → **"GitHub Repo"**
4. Select your repository
5. Railway will auto-detect - **cancel auto-deploy**
6. Click the service → **Settings**
7. Configure:
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Watch Paths**: Leave default
8. **Redeploy** the service

### Step 2: Create Frontend Service

1. In the same Railway project
2. Click **"New"** → **"GitHub Repo"** (same repo)
3. Railway will auto-detect - **cancel auto-deploy**
4. Click the service → **Settings**
5. Configure:
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l ${PORT}`
   - **Watch Paths**: `/frontend/**`
6. **Redeploy** the service

### Step 3: Environment Variables

#### Backend Service
Set in Railway dashboard → Backend service → Variables:
```
SANITY_PROJECT_ID=0c912k6j
SANITY_DATASET=production
PORT=3000
```

#### Frontend Service
Set in Railway dashboard → Frontend service → Variables:
```
REACT_APP_API_URL=https://your-backend-service.railway.app
PORT=3000
```

### Step 4: Update Frontend API URLs

After backend deploys, get its Railway URL and update:
- `frontend/src/App.js` - Line 17
- `frontend/src/components/ProjectsList.js` - Line 19

Replace `https://web-production-5b697.up.railway.app` with your new backend URL.

**Or** create an environment variable configuration file:

```javascript
// frontend/src/config.js
export const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-5b697.up.railway.app';
```

Then use it in your components instead of hardcoded URLs.

### Step 5: Generate Public URLs (Optional)

Both services will have default URLs. You can:
- Add custom domains in Railway dashboard
- Generate public URLs for each service

## Service URLs

After deployment:
- **Backend**: `https://your-backend-name.up.railway.app`
- **Frontend**: `https://your-frontend-name.up.railway.app`

## Testing

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.railway.app/api/health
   ```

2. **Test Filters**:
   ```bash
   curl https://your-backend-url.railway.app/api/filters
   ```

3. **Test Projects**:
   ```bash
   curl https://your-backend-url.railway.app/api/projects
   ```

4. **Visit Frontend**: Open the frontend Railway URL in browser

## CORS Configuration

Make sure your backend server has CORS enabled for your frontend domain. The server.js should already have this configured.

## Troubleshooting

### Backend won't start
- Check that `server.js` exists in root
- Verify `package.json` has all dependencies
- Check Railway logs for errors

### Frontend can't connect to backend
- Verify backend URL is correct in frontend code
- Check CORS settings in backend
- Ensure backend service is running

### Build failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check Railway build logs

## Advantages of This Setup

✅ **Independent Scaling**: Scale backend and frontend separately
✅ **Independent Deployments**: Deploy frontend without redeploying backend
✅ **Cost Effective**: Only pay for what you use
✅ **Easy Updates**: Push to GitHub, Railway auto-deploys
✅ **Monorepo Benefits**: Keep code together, deploy separately

