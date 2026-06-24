import * as fs from 'fs';
import * as path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { loadAppEnv } from './load-env';
import {
  dbHandlers,
  handleCancelRequest,
  handleSendRequest,
  initializeDatabase,
  shutdownDatabase,
} from './ipc-handlers';
import { stopMockServer } from './mock-server';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function resolveAppIconPath(): string {
  const candidates = [
    path.join(app.getAppPath(), 'out', 'icon.png'),
    path.join(app.getAppPath(), 'build', 'icon.png'),
    path.join(__dirname, '../../build/icon.png'),
    path.join(process.resourcesPath, 'build', 'icon.png'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Apilynx',
    icon: resolveAppIconPath(),
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:3000');
  } else {
    await mainWindow.loadFile(path.join(app.getAppPath(), 'out', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers(): void {
  ipcMain.handle('http:send', handleSendRequest);
  ipcMain.handle('http:cancel', (_event, signalId: string) => {
    handleCancelRequest(_event, signalId);
  });

  Object.entries(dbHandlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, handler as Parameters<typeof ipcMain.handle>[1]);
  });

  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getPlatform', () => process.platform);
}

app.whenReady().then(async () => {
  try {
    const envPath = loadAppEnv();
    if (envPath) {
      console.log(`Apilynx: loaded config from ${envPath}`);
    } else {
      console.warn('Apilynx: no .env found — using defaults / environment variables');
    }

    await initializeDatabase();
    registerIpcHandlers();
    await createWindow();
  } catch (error) {
    console.error('Failed to start Apilynx:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopMockServer();
  void shutdownDatabase();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
