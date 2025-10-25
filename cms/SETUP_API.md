# API Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the API server:**
   ```bash
   npm run api
   ```
   This will start the server on `http://localhost:3000`

3. **Test the endpoints:**
   ```bash
   npm run test-api
   ```

## Available Endpoints

- `GET /api/filters` - Returns compiled tags, institutions, and demands
- `GET /api/projects` - Returns all projects with related data
- `GET /api/health` - Health check endpoint

## Usage in Frontend

```javascript
// Fetch filter data
const filters = await fetch('http://localhost:3000/api/filters').then(r => r.json())

// Fetch all projects
const projects = await fetch('http://localhost:3000/api/projects').then(r => r.json())
```

## Troubleshooting

If you get "failed to fetch" errors:

1. Make sure the API server is running (`npm run api`)
2. Check that the server started successfully (should show "API server running at http://localhost:3000")
3. Verify your Sanity project ID and dataset are correct in `server.js`
4. Test the health endpoint: `curl http://localhost:3000/api/health`

## Development

- The API server runs on port 3000
- Sanity Studio runs on a different port (usually 3333)
- You can run both simultaneously for development

