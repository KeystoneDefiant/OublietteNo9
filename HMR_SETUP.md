# Hot Module Replacement (HMR) Setup Guide

## Overview

This project has been configured with Hot Module Replacement (HMR) to enable instant code updates during development without losing application state. This setup is optimized for Docker on Windows.

## What is HMR?

Hot Module Replacement allows you to:

- **Update code** and see changes instantly in the browser
- **Preserve state** - Your game state isn't lost on file changes
- **No page reload** - Faster development experience
- **Fast feedback loop** - See results immediately

## Docker Configuration

### Environment Variables

The following environment variables control HMR behavior:

```yaml
VITE_HMR_HOST=localhost      # Host for HMR connection
VITE_HMR_PORT=5173            # Port for HMR WebSocket
VITE_HMR_PROTOCOL=ws          # Protocol (ws or wss for secure)
```

### Port Mapping

- **5173** → Main Vite dev server (HTTP)
- **5174** → Secondary port for fallback

## Running with Docker

### Start Development Server with HMR

```bash
# Build and start the dev container
docker-compose up dev

# Or if container is already built
docker-compose start dev
```

The development server will start with HMR enabled. Access it at:

```
http://localhost:5173/Pokerthing/
```

### For Windows Subsystem for Linux (WSL2)

If using WSL2, update the docker-compose environment:

```yaml
environment:
  - VITE_HMR_HOST=host.docker.internal # Windows host machine
  - VITE_HMR_PORT=5173
  - VITE_HMR_PROTOCOL=ws
```

### For Docker Desktop (Windows Native)

```yaml
environment:
  - VITE_HMR_HOST=localhost
  - VITE_HMR_PORT=5173
  - VITE_HMR_PROTOCOL=ws
```

## Configuration Details

### vite.config.ts

```typescript
server: {
  host: '0.0.0.0',           // Listen on all interfaces
  port: 5173,                 // Dev server port
  strictPort: false,          // Fall back to next available port
  hmr: {
    host: process.env.VITE_HMR_HOST || 'localhost',
    port: parseInt(process.env.VITE_HMR_PORT || '5173'),
    protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
  },
  watch: {
    usePolling: true,         // Required for Docker on Windows
  },
},
```

### Key Settings Explained

- **host: 0.0.0.0** - Dev server listens on all network interfaces
- **usePolling: true** - Required for file watching in Docker on Windows (disables inotify)
- **hmr config** - Tells browser where to connect for HMR updates

## Troubleshooting

### HMR Not Working

**Problem:** Changes don't reflect in browser

**Solutions:**

1. Check browser console for WebSocket errors
2. Verify port 5173 is accessible: `curl http://localhost:5173`
3. Check Docker logs: `docker logs pokerthing-dev`
4. Verify environment variables are set: `docker-compose config`

### WebSocket Connection Refused

**Problem:** `WebSocket is closed before the connection is established`

**Solutions:**

1. Update `VITE_HMR_HOST` if using WSL2:

   ```yaml
   - VITE_HMR_HOST=host.docker.internal
   ```

2. Check if firewall is blocking port 5173
3. For Windows Defender:
   - Allow Node.js through Windows Defender Firewall
   - Allow Docker through firewall

### Slow File Detection

**Problem:** Changes take a long time to appear

**Solutions:**

1. File polling is slower than inotify - this is expected in Docker
2. Increase polling interval if needed:
   ```typescript
   watch: {
     usePolling: true,
     interval: 1000,  // milliseconds
   }
   ```

### Changes Lost After HMR Update

**Problem:** Game state resets when code changes

**Solutions:**

1. This is normal for some types of changes (restructuring files)
2. To preserve state during smaller changes:
   - Only modify component internals, not signatures
   - Avoid renaming component files
   - Keep component structure stable

## Development Workflow

### Typical Development Session

```bash
# 1. Start the development container
docker-compose up dev

# 2. Open browser to http://localhost:5173/Pokerthing/

# 3. Edit code in your editor
# - Changes are automatically detected
# - HMR updates the browser instantly
# - Game state is preserved (usually)

# 4. Check console for any errors
# - Browser DevTools → Console tab
# - Docker logs: docker logs pokerthing-dev

# 5. Stop development when done
# - Press Ctrl+C in terminal
# - Or: docker-compose stop dev
```

### File Change Scenarios

#### Fast HMR (State Preserved)

- Modify CSS/SCSS
- Update component styling (className)
- Change component logic inside functions
- Update prop handling

#### Full Reload (State Lost)

- Rename components
- Change component signature
- Move/delete files
- Add new exports

## Performance Tips

### Optimize Development Speed

1. **Use Chrome DevTools locally**
   - Open http://localhost:5173
   - F12 to open DevTools
   - Stay on the Network and Console tabs

2. **Disable unused features during development**
   - Only load needed themes
   - Minimize console logging in production code

3. **Build incrementally**
   - Edit one feature at a time
   - Test changes before moving to next feature

4. **Monitor container resources**
   ```bash
   docker stats pokerthing-dev
   ```

## Advanced Configuration

### Custom HMR Setup (if needed)

Edit `vite.config.ts` for advanced HMR options:

```typescript
hmr: {
  host: process.env.VITE_HMR_HOST || 'localhost',
  port: parseInt(process.env.VITE_HMR_PORT || '5173'),
  protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
  timeout: 30000,        // HMR connection timeout
  overlay: true,         // Show error overlay in browser
},
```

### Disable HMR (if problematic)

To temporarily disable HMR:

```typescript
hmr: false,
```

Or set environment variable:

```bash
VITE_HMR_DISABLED=true npm run dev
```

## Docker Compose Commands

### Start Development Container

```bash
# Start in attached mode (see logs)
docker-compose up dev

# Start in detached mode (background)
docker-compose up -d dev

# Start fresh (rebuild images)
docker-compose up --build dev
```

### View Logs

```bash
# Stream logs in real-time
docker logs -f pokerthing-dev

# Or via docker-compose
docker-compose logs -f dev
```

### Stop Container

```bash
# Stop but don't remove
docker-compose stop dev

# Stop and remove
docker-compose down dev
```

### Execute Commands in Running Container

```bash
# Install new packages
docker-compose exec dev npm install [package-name]

# View node version
docker-compose exec dev node --version

# Access container shell
docker-compose exec dev sh
```

## Useful Browser DevTools

### Enable Remote Debugging

```bash
docker run --rm -it pokerthing-dev node --inspect-brk=0.0.0.0:9229 node_modules/.bin/vite
```

Then visit `chrome://inspect` in Chrome

### Monitor Network Activity

1. Open DevTools (F12)
2. Go to Network tab
3. Look for WebSocket connection to see HMR activity

## Common Error Messages

### "WebSocket is closed before the connection is established"

- Check firewall settings
- Verify VITE_HMR_HOST is correct for your setup
- Check if port 5173 is available

### "EACCES: permission denied"

- File system permissions issue
- Ensure Docker has write access to project directory

### "Port 5173 is already in use"

- Check if another service is using the port
- Stop other containers: `docker-compose down`
- Change port in docker-compose.yml if needed

### "Module not found" after changes

- Node cache issue
- Stop dev server and start fresh
- `docker-compose down dev` then `docker-compose up dev`

## Environment Setup Checklist

For Windows + Docker Desktop:

- [x] Docker Desktop installed and running
- [x] WSL2 backend (if using WSL2)
- [x] Port 5173 not blocked by firewall
- [x] Project mounted as volume in docker-compose.yml
- [x] Node modules volume created separately
- [x] VITE_HMR_HOST set to localhost or host.docker.internal
- [x] npm run dev command in docker-compose.yml

## References

- [Vite HMR Documentation](https://vitejs.dev/config/server-options.html#server-hmr)
- [React HMR Support](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)
- [Docker Development Guide](https://docs.docker.com/develop/)
- [WSL2 Docker Integration](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers)

## Need Help?

If HMR isn't working:

1. **Check Docker logs**

   ```bash
   docker logs pokerthing-dev
   ```

2. **Verify port accessibility**

   ```bash
   curl http://localhost:5173
   ```

3. **Check environment variables**

   ```bash
   docker-compose config | grep VITE_HMR
   ```

4. **Test WebSocket connection**
   - Open DevTools Console
   - Look for connection messages
   - Check Network tab for WebSocket activity

5. **Force restart**
   ```bash
   docker-compose down
   docker-compose up --build dev
   ```
