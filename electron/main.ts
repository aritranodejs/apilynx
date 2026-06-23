import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '../../.env') });

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import {
  dbHandlers,
  handleCancelRequest,
  handleSendRequest,
  initializeDatabase,
  shutdownDatabase,
} from './ipc-handlers';
import { stopMockServer } from './mock-server';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'ReqForge',
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
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../out/index.html'));
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
    await initializeDatabase();
    registerIpcHandlers();
    await createWindow();
  } catch (error) {
    console.error('Failed to start ReqForge:', error);
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
