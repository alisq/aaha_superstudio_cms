# Using Multiple Node.js Versions on Opalstack

## How NVM Works

**NVM (Node Version Manager) installs Node.js versions in your user directory** (`~/.nvm/`), NOT system-wide. This means:

✅ **Other applications are NOT affected**
✅ **System Node.js remains unchanged**
✅ **Each application can use a different Node version**
✅ **No conflicts between applications**

## Managing Multiple Node Versions

### Install Multiple Versions

```bash
# Install Node 16 for older apps
nvm install 16

# Install Node 18 for newer apps
nvm install 18

# Install Node 20 if needed
nvm install 20
```

### List Installed Versions

```bash
nvm list
# Shows:
#   v16.20.2
#   v18.17.0
# -> v20.9.0
#   default -> 18.17.0
```

### Use Specific Version for Each Application

**Method 1: Set in Opalstack Panel (Per-App)**

For each Node.js app in Opalstack, set the full path to the Node version you want:

- **App 1 (needs Node 16):**
  - Start command: `/home/your-username/.nvm/versions/node/v16.20.2/bin/node server.js`

- **App 2 (needs Node 18):**
  - Start command: `/home/your-username/.nvm/versions/node/v18.17.0/bin/node server.js`

**Method 2: Use .nvmrc Files**

1. Create a `.nvmrc` file in each app directory:
   ```bash
   # In app1 directory
   echo "16" > ~/apps/old-app/.nvmrc
   
   # In app2 directory
   echo "18" > ~/apps/new-app/.nvmrc
   ```

2. In Opalstack start command, use:
   ```
   source ~/.nvm/nvm.sh && nvm use && node server.js
   ```

**Method 3: Environment Variables Per-App**

In Opalstack panel → Your App → Environment Variables:
- Set `NODE_PATH` and `PATH` to point to specific Node version
- This keeps each app isolated

### Default Version

Set a default version (this only affects new terminal sessions):
```bash
nvm alias default 18
```

This doesn't affect applications that specify their own Node path!

## Application Isolation Example

```
~/apps/
├── old-app/          → Uses Node 16 via NVM
│   └── server.js     → Start: ~/.nvm/versions/node/v16.x.x/bin/node server.js
│
├── new-app/          → Uses Node 18 via NVM
│   └── server.js     → Start: ~/.nvm/versions/node/v18.x.x/bin/node server.js
│
└── system-app/       → Uses system Node (if exists)
    └── server.js     → Start: /usr/bin/node server.js
```

## Best Practices

1. **Use full paths in Opalstack start commands** - Most reliable
2. **Document which Node version each app uses** - Keep a README
3. **Test each app after Node changes** - Verify compatibility
4. **Don't delete old Node versions** - Keep them for compatibility

## Checking What Node Version an App Uses

```bash
# Check which Node a running process uses
ps aux | grep node

# Check Node version in a specific directory
cd ~/apps/my-app
which node
node --version
```

## Summary

- ✅ NVM is user-level, not system-level
- ✅ Each Opalstack app can use a different Node version
- ✅ Other applications are completely unaffected
- ✅ System Node.js (if any) remains untouched
- ✅ You control Node version per application via Opalstack panel

