import path from "path";
import url from "url";
import fs from "fs";

import { app, BrowserWindow, protocol, ipcMain } from "electron";

import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { mainnet } from "@filecoin-shipyard/lotus-client-schema";

import fetch from "fetch";

const apiUrl = "wss://api.chain.love/rpc/v0"
const provider = new NodejsProvider(apiUrl)
const client = new LotusRPC(provider, { schema: mainnet.fullNode })

let mainWindow;
let state = null;
let dev = false;



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

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: "hiddenInset",
    width: 1024,
    height: 768,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
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
  // TODO(why)
  // This is where you can do NodeJS stuff.

  // NOTE(why)
  ipcMain.handle("add-root", async (event, destination, root) => {
    // Whatever this function returns, is what the client gets when it calls
    // const result = await ipcRenderer.invoke("add-root");

    return "Hello World";
  });

  ipcMain.handle("get-balance", async (event, address) => {
    // TODO(why): can cache this in local state so we can present the user nice information even when offline
    let actor = await client.stateGetActor(address, [])

    console.log("ACTOR CALL: ", actor)
    return {
      "balance":   actor.Balance,
      "timestamp": new Date()
    }
  });

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
