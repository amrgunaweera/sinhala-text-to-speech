import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import * as esbuild from 'esbuild';

// Check if a port is responding
function checkPort(port, host = '127.0.0.1', timeout = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function waitForServer(port, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkPort(port)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function runDev() {
  // 1. Build initial electron files
  await esbuild.build({
    entryPoints: ['electron/main.ts'],
    outfile: 'dist-electron/main.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['electron'],
  });

  await esbuild.build({
    entryPoints: ['electron/preload.ts'],
    outfile: 'dist-electron/preload.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['electron'],
  });

  // 2. Start dev server
  const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' },
  });

  const ready = await waitForServer(3000);
  if (!ready) {
    console.error('Server failed to start on port 3000');
    serverProcess.kill();
    process.exit(1);
  }

  // 3. Launch Electron
  const electronProcess = spawn('npx', ['electron', '.'], {
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://127.0.0.1:3000',
    },
  });

  electronProcess.on('close', () => {
    serverProcess.kill();
    process.exit(0);
  });
}

runDev().catch(console.error);

