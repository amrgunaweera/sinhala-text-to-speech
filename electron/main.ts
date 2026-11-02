import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';
import { startServer } from '../server.js';

let mainWindow: BrowserWindow | null = null;
let serverInstance: any = null;

// Determine an open port for the local loopback server
function getAvailablePort(startingPort = 3000): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startingPort, '127.0.0.1', () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      const alt = net.createServer();
      alt.listen(0, '127.0.0.1', () => {
        const { port } = alt.address() as net.AddressInfo;
        alt.close(() => resolve(port));
      });
    });
  });
}

async function createWindow(url: string) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'SinhalaVoice Studio',
    backgroundColor: '#020617', // slate-950
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(url);
}

async function initialize() {
  const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await createWindow(process.env.VITE_DEV_SERVER_URL);
    return;
  }

  // Find a free port and launch the embedded Express server
  const port = await getAvailablePort(3000);
  process.env.PORT = String(port);
  process.env.ELECTRON_PROD = 'true';
  process.env.NODE_ENV = 'production';

  const { server } = await startServer(port);
  serverInstance = server;

  await createWindow(`http://127.0.0.1:${port}`);
}

app.whenReady().then(initialize).catch((err) => {
  console.error('Failed to initialize application:', err);
  app.quit();
});

app.on('window-all-closed', () => {
  if (serverInstance && typeof serverInstance.close === 'function') {
    try {
      serverInstance.close();
    } catch {
      // ignore
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initialize();
  }
});

