# Step-by-Step: Fixing GLIBC Errors on Opalstack

## Problem
The system's Node.js binary requires newer GLIBC than your server has. Even after installing NVM, the system Node is still being used.

## Solution: Force NVM Node Usage

### Step 1: Verify NVM Installation

```bash
# Check if NVM is installed
ls -la ~/.nvm

# If it doesn't exist, install NVM:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM in current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Step 2: Install Node.js via NVM (Use Node 16 for Best Compatibility)

```bash
# Make sure NVM is loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 16 (better compatibility with older GLIBC)
nvm install 16

# Verify installation
nvm use 16
node --version
which node
# Should show: /home/iamasq/.nvm/versions/node/v16.x.x/bin/node
```

**Note the full path!** You'll need this for Opalstack configuration.

### Step 3: Use NVM Node for npm install

**Instead of just running `npm install`, use the full path:**

```bash
cd ~/apps/superstudiocms_aaha_ca/cms  # Adjust to your path

# Use NVM's Node directly
~/.nvm/versions/node/v16.x.x/bin/npm install --production

# OR set up the environment first
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 16
npm install --production
```

### Step 4: Find Your NVM Node Path

```bash
# After installing Node via NVM, get the exact path
which node
# Example output: /home/iamasq/.nvm/versions/node/v16.20.2/bin/node

# Or list all NVM Node versions and paths
ls -la ~/.nvm/versions/node/
```

**Copy this full path!** You'll need it for Opalstack.

### Step 5: Configure Opalstack to Use NVM Node

In **Opalstack Panel** → Your Node.js App → **Settings**:

**Option A: Update Start Command (Recommended)**

Change the start command from:
```
npm run server
```

To:
```
/home/iamasq/.nvm/versions/node/v16.x.x/bin/node server.js
```

(Replace `16.x.x` with your actual version number)

**Option B: Use Environment Variables**

Add these environment variables in Opalstack panel:

1. **NVM_DIR** = `/home/iamasq/.nvm`
2. **PATH** = `/home/iamasq/.nvm/versions/node/v16.x.x/bin:$PATH`

Then your start command can be: `npm run server`

### Step 6: Create a Wrapper Script (Alternative Solution)

If Opalstack keeps using system Node, create a wrapper script:

```bash
cd ~/apps/superstudiocms_aaha_ca/cms
nano start.sh
```

Add this content:
```bash
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 16
exec node server.js
```

Make it executable:
```bash
chmod +x start.sh
```

Then in Opalstack panel, set start command to:
```
/home/iamasq/apps/superstudiocms_aaha_ca/cms/start.sh
```

### Step 7: Verify It Works

After configuring, restart your app in Opalstack panel and check logs. The GLIBC errors should be gone!

Test locally first:
```bash
cd ~/apps/superstudiocms_aaha_ca/cms
~/.nvm/versions/node/v16.x.x/bin/node server.js
```

If this works without GLIBC errors, then Opalstack will work too!

## Troubleshooting

### Still Getting GLIBC Errors?

1. **Check which Node is being used:**
   ```bash
   which node
   # Should show ~/.nvm path, NOT /usr/bin/node or similar
   ```

2. **Try Node 14 (even older, more compatible):**
   ```bash
   nvm install 14
   nvm use 14
   # Use this version in Opalstack
   ```

3. **Check your GLIBC version:**
   ```bash
   ldd --version
   # If it's very old (< 2.17), you may need Node 12 or 14
   ```

4. **Verify NVM Node works:**
   ```bash
   ~/.nvm/versions/node/v16.x.x/bin/node --version
   # Should work without errors
   ```

## Quick Reference

**Your NVM Node path format:**
```
/home/iamasq/.nvm/versions/node/v16.x.x/bin/node
```

**To install dependencies:**
```bash
/home/iamasq/.nvm/versions/node/v16.x.x/bin/npm install --production
```

**To run server locally:**
```bash
/home/iamasq/.nvm/versions/node/v16.x.x/bin/node server.js
```

