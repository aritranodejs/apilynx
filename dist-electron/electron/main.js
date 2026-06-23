"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path.join(__dirname, '../../.env') });
const electron_1 = require("electron");
const ipc_handlers_1 = require("./ipc-handlers.js");
const mock_server_1 = require("./mock-server.js");
const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
let mainWindow = null;
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
        void electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    if (isDev) {
        await mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        await mainWindow.loadFile(path.join(__dirname, '../../out/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
function registerIpcHandlers() {
    electron_1.ipcMain.handle('http:send', ipc_handlers_1.handleSendRequest);
    electron_1.ipcMain.handle('http:cancel', (_event, signalId) => {
        (0, ipc_handlers_1.handleCancelRequest)(_event, signalId);
    });
    Object.entries(ipc_handlers_1.dbHandlers).forEach(([channel, handler]) => {
        electron_1.ipcMain.handle(channel, handler);
    });
    electron_1.ipcMain.handle('app:getVersion', () => electron_1.app.getVersion());
    electron_1.ipcMain.handle('app:getPlatform', () => process.platform);
}
electron_1.app.whenReady().then(async () => {
    try {
        await (0, ipc_handlers_1.initializeDatabase)();
        registerIpcHandlers();
        await createWindow();
    }
    catch (error) {
        console.error('Failed to start ReqForge:', error);
        electron_1.app.quit();
    }
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            void createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    (0, mock_server_1.stopMockServer)();
    void (0, ipc_handlers_1.shutdownDatabase)();
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
