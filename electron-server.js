import * as IPCHandlers from "~/src/common/handlers";

import { app, BrowserWindow, remote, ipcMain, protocol } from "electron";

import fs from "fs";
import path from "path";
import url from "url";
import flatCache from "flat-cache";

const NEW_DEFAULT_SETTINGS = {
  settings: true,
};

const NEW_DEFAULT_CONFIG = {
  config: true,
  API_URL: "https://api.chain.love/rpc/v0",
  INDEX_URL: "https://api.chain.love/wallet",
};

const NEW_DEFAULT_ACCOUNTS = {
  accounts: true,
  addresses: [],
};

let mainWindow;
let dev = false;
let provider = null;
let client = null;
let transport = null;

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development") {
  dev = true;
}

// NOTE(external-alex)
// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === "win32") {
  app.commandLine.appendSwitch("high-dpi-support", "true");
  app.commandLine.appendSwitch("force-device-scale-factor", "1");
}

const icon = path.join(__dirname, "build", "icons", "mac", "icon.icns");
console.log("loading icons ... ", { icon });

const APPLICATION_DATA_PATH = (app || remote.app).getPath("userData");

global.memory = {
  paths: {
    app: APPLICATION_DATA_PATH,
    root: path.join(APPLICATION_DATA_PATH, ".wallet"),
    settings: path.join(APPLICATION_DATA_PATH, ".wallet", "settings.json"),
    config: path.join(APPLICATION_DATA_PATH, ".wallet", "config.json"),
    accounts: path.join(APPLICATION_DATA_PATH, ".wallet", "accounts.json"),
    cache: path.join(APPLICATION_DATA_PATH, "cache"),
    message: path.join(APPLICATION_DATA_PATH, "cache", "msg"),
    code: path.join(APPLICATION_DATA_PATH, "cache", "code"),
  },
  caches: {
    message: null,
    code: null,
  },
  transport: null,
};

console.log("loading globals ... ", global.memory);

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: "hiddenInset",
    width: 640,
    height: 556,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: icon,
  });

  // NOTE(jim): HTML path for HTMLWebpackPlugin
  let indexPath;
  if (dev && process.argv.indexOf("--noDevServer") === -1) {
    indexPath = url.format({
      protocol: "http:",
      host: "localhost:8080",
      pathname: "index.html",
      slashes: true,
    });
  } else {
    indexPath = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "dist", "index.html"),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (dev) {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require("electron-devtools-installer");

      installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
        console.log("Error loading React DevTools: ", err)
      );

      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  return mainWindow;
}

app.on("ready", async () => {
  for (const entity of IPCHandlers.default) {
    console.log("binding ... ", entity.key);
    ipcMain.handle(entity.key, entity.method);
  }

  // NOTE(jim): Enable this line to wipe state.
  // await fs.promises.rmdir(global.memory.paths.root, { recursive: true });
  const maybeRootExists = await fs.existsSync(global.memory.paths.root);
  if (!maybeRootExists) {
    await fs.promises.mkdir(global.memory.paths.root);
  }

  const maybeSettingsExists = await fs.existsSync(global.memory.paths.settings);
  if (!maybeSettingsExists) {
    await fs.promises.writeFile(
      global.memory.paths.settings,
      JSON.stringify(NEW_DEFAULT_SETTINGS),
      {
        encoding: "utf8",
      }
    );
  }

  const maybeConfigExists = await fs.existsSync(global.memory.paths.config);
  if (!maybeConfigExists) {
    await fs.promises.writeFile(global.memory.paths.config, JSON.stringify(NEW_DEFAULT_CONFIG), {
      encoding: "utf8",
    });
  }

  const maybeAccountsExist = await fs.existsSync(global.memory.paths.accounts);
  if (!maybeAccountsExist) {
    await fs.promises.writeFile(
      global.memory.paths.accounts,
      JSON.stringify(NEW_DEFAULT_ACCOUNTS),
      {
        encoding: "utf8",
      }
    );
  }

  const maybeCachePathExists = await fs.existsSync(global.memory.paths.cache);
  if (!maybeCachePathExists) {
    console.log("creating cache root ... ", global.memory.paths.cache);
    await fs.promises.mkdir(global.memory.paths.cache);
  }

  const maybeMessageCacheExists = await fs.existsSync(global.memory.paths.message);
  if (!maybeMessageCacheExists) {
    console.log("creating cache message folder ... ", global.memory.paths.message);
    await fs.promises.mkdir(global.memory.paths.message);
  }

  const maybeCodeCacheExists = await fs.existsSync(global.memory.paths.code);
  if (!maybeCodeCacheExists) {
    console.log("creating code cache folder ... ", global.memory.paths.code);
    await fs.promises.mkdir(global.memory.paths.code);
  }

  // NOTE(jim)
  // Initialize flat cache.
  console.log("loading message cache ... ", global.memory.paths.message);
  global.memory.caches.message = flatCache.load("msgcache", global.memory.paths.message);
  console.log("loading code cache ... ", global.memory.paths.code);
  global.memory.caches.code = flatCache.load("codecache", global.memory.paths.code);

  return createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    return createWindow();
  }
});
