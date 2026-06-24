import * as fs from 'fs';
import * as path from 'path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
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

function formatStartupError(error: unknown, envPath: string | null): string {
  const message = error instanceof Error ? error.message : String(error);
  const lines = [
    message,
    '',
    'Common fixes:',
    '• Ensure this PC has internet access',
    '• MongoDB Atlas → Network Access → add this machine\'s IP (or 0.0.0.0/0)',
    '• Confirm ~/.config/Apilynx/.env or bundled config has MONGODB_URI',
  ];
  if (envPath) {
    lines.push(`• Config loaded from: ${envPath}`);
  } else {
    lines.push('• No .env found — app tried default local MongoDB');
  }
  lines.push('', 'Debug: run in terminal → apilynx --enable-logging');
  return lines.join('\n');
}

function writeStartupLog(error: unknown, envPath: string | null): string {
  const logPath = path.join(app.getPath('userData'), 'startup-error.log');
  const body = [
    `Time: ${new Date().toISOString()}`,
    `Env: ${envPath ?? 'not found'}`,
    `Mongo URI set: ${Boolean(process.env.MONGODB_URI)}`,
    '',
    error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ''}` : String(error),
  ].join('\n');
  fs.writeFileSync(logPath, body);
  return logPath;
}

app.whenReady().then(async () => {
  let envPath: string | null = null;
  try {
    envPath = loadAppEnv();
    if (envPath) {
      console.log(`Apilynx: loaded config from ${envPath}`);
      console.log(`Apilynx: MONGODB_URI ${process.env.MONGODB_URI ? 'is set' : 'is NOT set'}`);
    } else {
      console.warn('Apilynx: no .env found — using defaults / environment variables');
    }

    await initializeDatabase();
    registerIpcHandlers();
    await createWindow();
  } catch (error) {
    console.error('Failed to start Apilynx:', error);
    const logPath = writeStartupLog(error, envPath);
    dialog.showErrorBox(
      'Apilynx could not start',
      `${formatStartupError(error, envPath)}\n\nLog saved: ${logPath}`
    );
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
