# Deploying to Opalstack

This guide will help you deploy your API server to Opalstack.

## Prerequisites

1. Opalstack account with Node.js application capability
2. SSH access to your Opalstack server
3. Domain or subdomain configured

## Step-by-Step Deployment

### 1. Create Node.js Application in Opalstack Panel

1. Log into your Opalstack panel
2. Go to **Apps** → **Node.js**
3. Click **Add App**
4. Configure:
   - **App name:** `superstudio-api` (or your preferred name)
   - **App port:** `3000` (or note the port assigned)
   - **Start command:** `npm run server`
   - **Working directory:** `app_name` (this is your app directory)

### 2. Upload Your Files

**Option A: Using Git (Recommended)**

1. SSH into your Opalstack server:
   ```bash
   ssh your-username@your-server.com
   ```

2. Navigate to your app directory:
   ```bash
   cd ~/apps/superstudio-api  # Replace with your app name
   ```

3. Clone your repository:
   ```bash
   git clone https://github.com/your-username/aaha_superstudio_cms.git .
   cd cms
   ```

**Option B: Using SFTP/FTP**

1. Upload the entire `cms` directory to your Opalstack app directory
2. The path should be: `~/apps/your-app-name/`

### 3. Install Dependencies

```bash
cd ~/apps/superstudio-api/cms  # Adjust path as needed
npm install --production
```

### 4. Configure Environment Variables (Optional)

If you need to customize Sanity settings, you can:

1. In Opalstack panel → Your Node.js App → **Environment Variables**
2. Add any needed variables:
   - `PORT` (if you want to override the port)
   - `NODE_ENV=production`

### 5. Update server.js for Opalstack

The server should use the port assigned by Opalstack. The current configuration uses `process.env.PORT || 3000`, which should work automatically.

### 6. Start/Restart the Application

In the Opalstack panel:
1. Go to your Node.js app
2. Click **Restart App**

Or via SSH:
```bash
cd ~/apps/superstudio-api/cms
# Restart via Opalstack panel or use PM2 if installed
```

### 7. Configure Domain/Subdomain

1. In Opalstack panel → **Domains**
2. Point your domain/subdomain to your Node.js app
3. Example: `api.yourdomain.com` → `superstudio-api` app

### 8. Test Your API

Once deployed, test your endpoints:

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Get all projects
curl https://api.yourdomain.com/api/projects

# Get filters
curl https://api.yourdomain.com/api/filters
```

## Using PM2 (Optional - For Better Process Management)

If you want more control over the process:

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem file** (`cms/ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'superstudio-api',
       script: './server.js',
       instances: 1,
       exec_mode: 'fork',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

3. **Start with PM2:**
   ```bash
   cd ~/apps/superstudio-api/cms
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Troubleshooting

### GLIBC Version Errors (GLIBC_2.27/2.28 not found)

If you see errors like:
```
node: version `GLIBC_2.27' not found
node: version `GLIBCXX_3.4.21' not found
```

This means your Node.js binary is too new for your server's GLIBC version. **Solutions:**

**Solution 1: Use NVM (Node Version Manager) - Recommended**

1. Install NVM:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   ```

2. Install a compatible Node.js version (LTS 16 or 18 work well with older systems):
   ```bash
   nvm install 18
   nvm use 18
   nvm alias default 18
   ```

3. Verify Node version:
   ```bash
   node --version
   which node
   ```

4. Update your start command in Opalstack panel to use the NVM Node:
   - Instead of `npm run server`, use: `/home/your-username/.nvm/versions/node/v18.x.x/bin/node server.js`
   - Or set PATH in environment variables: `PATH=/home/your-username/.nvm/versions/node/v18.x.x/bin:$PATH`

**Solution 2: Use Opalstack's Built-in Node.js**

1. Check if Opalstack provides Node.js:
   ```bash
   which node
   opalstack-cli nodejs list  # If you have opalstack-cli
   ```

2. Use the system-provided Node version if available

**Solution 3: Check System Node Version**

1. Check what's available:
   ```bash
   ls -la /usr/bin/node*
   /usr/bin/node --version  # If it exists
   ```

2. If an older Node is available, use it directly:
   ```bash
   /usr/bin/node server.js
   ```

**Solution 4: Use Node 16 (Better Compatibility)**

Node 16 has better compatibility with older GLIBC versions. Install via NVM:
```bash
nvm install 16
nvm use 16
```

### Application Not Starting

1. Check logs in Opalstack panel → **Logs**
2. Or check via SSH:
   ```bash
   cd ~/apps/superstudio-api/cms
   npm run server
   ```

3. Check Node and npm versions:
   ```bash
   node --version
   npm --version
   which node
   ```

### Port Issues

- Make sure the port in `server.js` matches what Opalstack assigned
- Check Opalstack panel → Your App → **Settings** for the assigned port

### CORS Issues

The server already has CORS enabled. If you need to restrict it to specific domains, update the CORS configuration in `server.js`.

### Dependencies Issues

Make sure you're running `npm install` from the `cms` directory:
```bash
cd ~/apps/superstudio-api/cms
npm install
```

If you get permission errors, use:
```bash
npm install --production --prefix ~/apps/superstudio-api/cms
```

## File Structure on Opalstack

```
~/apps/superstudio-api/
├── cms/
│   ├── server.js
│   ├── package.json
│   ├── node_modules/
│   └── ... (other files)
```

## Next Steps

After deployment, update your frontend to use the new API URL:
```javascript
const API_URL = 'https://api.yourdomain.com';
const projects = await fetch(`${API_URL}/api/projects`).then(r => r.json());
```

