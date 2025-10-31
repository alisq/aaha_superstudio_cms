# Fixing GLIBC Errors on Opalstack

## Quick Fix: Install Node.js via NVM

The GLIBC errors occur because your Node.js binary was compiled for a newer Linux system than what's on your Opalstack server.

### Step-by-Step Fix

1. **SSH into your Opalstack server:**
   ```bash
   ssh your-username@your-server.com
   ```

2. **Install NVM (Node Version Manager):**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

3. **Reload your shell configuration:**
   ```bash
   source ~/.bashrc
   # OR
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

4. **Install Node.js 18 (LTS - good compatibility):**
   ```bash
   nvm install 18
   nvm use 18
   nvm alias default 18
   ```

5. **Verify it works:**
   ```bash
   node --version  # Should show v18.x.x
   which node       # Should show path in ~/.nvm
   ```

6. **Navigate to your app and test:**
   ```bash
   cd ~/apps/your-app-name/cms
   node server.js
   ```

### Configure Opalstack to Use NVM Node

**Option A: Update Start Command**

In Opalstack panel → Your Node.js App → Settings:
- **Start command:** Replace `npm run server` with:
  ```
  /home/your-username/.nvm/versions/node/v18.x.x/bin/node server.js
  ```
  (Replace `your-username` and `v18.x.x` with your actual values)

**Option B: Set PATH in Environment Variables**

In Opalstack panel → Your Node.js App → Environment Variables, add:
- **Variable:** `PATH`
- **Value:** `/home/your-username/.nvm/versions/node/v18.x.x/bin:$PATH`

Then your start command can remain: `npm run server`

### Alternative: Use Node 16 (If Node 18 Still Has Issues)

```bash
nvm install 16
nvm use 16
nvm alias default 16
```

Node 16 has better compatibility with older GLIBC versions.

### Verify the Fix

After configuring, restart your app in Opalstack panel and check the logs. The GLIBC errors should be gone!

If you still see issues, check:
```bash
# Check GLIBC version on server
ldd --version

# Check Node binary requirements
strings $(which node) | grep GLIBC
```

