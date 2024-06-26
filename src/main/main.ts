/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
const fs = require('fs');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
// /Users/bazil/Documents/TSM-SIMULATOR/data_output.json
// const filePath = path.join(app.getPath('desktop'), 'Demo/TSM-FCC/data_output.json');
// C:\Users\ESFORGE-03\Desktop\trmpDemo\data_output.json
const filePath = path.join(app.getPath('desktop'), 'trmpDemo/data_output.json');
console.log(filePath);
ipcMain.on('read-json', (event) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.log("Failed to read file: ", err);
      event.reply('read-json-response', { success: false, message: err.message });
    } else {
      try {
        const jsonData = JSON.parse(data);
        console.log("File read successfully");
        event.reply('read-json-response', { success: true, data: jsonData });
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        event.reply('read-json-response', { success: false, message: parseError.message });
      }
    }
  });
});




ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
ipcMain.on('save-json', (event, args) => {
  const { data, filename } = args;
  const baseDirectory = 'C:\\Users\\ESFORGE-01\\Desktop\\TSM_II_Product\\Content\\JSON_Files';
  const filePath = path.join(baseDirectory, filename);
    
  // const filePath = path.join(app.getPath('documents'), filename);
  console.log("filename: ",filePath);
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8', (err) => {
    if (err) {
      // Send error back to renderer process
      console.log("Failed: ",err);
      event.reply('save-json-response', { success: false, message: err.message });
    } else {
      // Send success message back to renderer process
      console.log("SAved");
      event.reply('save-json-response', { success: true, message: 'File saved successfully.' });
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // Set up the interval to send the read trigger every 5 seconds
    setInterval(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('trigger-json-read');
      }
    }, 500);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  new AppUpdater();
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
