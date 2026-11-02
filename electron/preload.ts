import { contextBridge } from 'electron';

// Expose safe desktop environment info if needed
contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  isDesktop: true,
});

