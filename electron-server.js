import path from "path";
import url from "url";
import fs from "fs";
import fetch from "fetch";

import { app, BrowserWindow, protocol, ipcMain } from "electron";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { mainnet } from "@filecoin-shipyard/lotus-client-schema";
import { FilecoinNumber, Converter } from "@glif/filecoin-number";
import signing from "@zondax/filecoin-signing-tools";
//import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"; // i need this but it breaks things

const NEW_DEFAULT_SETTINGS = { settings: true };
const NEW_DEFAULT_CONFIG = {
  config: true,
  API_URL: "wss://api.chain.love/rpc/v0",
  INDEX_URL: "https://api.chain.love/wallet"
};
const NEW_DEFAULT_ACCOUNTS = { accounts: true, addresses: [] };

let mainWindow;
let dev = false;
let provider = null;
let client = null;

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
    let actor = await client.stateGetActor(address, []);

    return {
      balance: actor.Balance,
      timestamp: new Date(),
    };
  });

  ipcMain.handle("get-transactions", async (event, address) => {
    const resp = await fetch(indexUrl + "/index/msgs/for/" + address);

    return resp.json();
  });

  ipcMain.handle("get-message", async (event, mcid) => {
    return await client.chainGetMessage(mcid)
  });

  ipcMain.handle("sign-message", async (event, message) => {
    try {
    let sender = message.from
    if (sender.startsWith("f0")) {
      // ID form address used, lets normalize to pubkey form to make checking things easier
      sender = await client.stateAccountKey(sender, [])
    }

    if (/* message.from is ledger address */ true) {

      let pathForSender = "asdasdasd"
      const transport = await TransportNodeHid.create() // TODO: maybe this should be a global?

      const signature = signing.transactionSignRawWithDevice( message, pathForSender, transport)

      return signedMessage = {
        message: message,
        signature: signature,
      }

      return { result: signedMessage }
      
    }

    return { error: "unable to sign with address" }

    } catch (e) {
      return { error: e }
    }
  });

  ipcMain.handle("estimate-gas", async (event, message) => {
    let estim = await client.gasEstimateMessageGas(message, {}, [])

    return estim.json();
  });

  ipcMain.handle("get-accounts", async (event) => {
    const p = path.join(__dirname, ".wallet", "accounts.json");
    const f = await fs.promises.readFile(p, "utf8");

    return JSON.parse(f);
  });

  ipcMain.handle("write-accounts", async (event, nextAccountData) => {
    const p = path.join(__dirname, ".wallet", "accounts.json");
    const f = await fs.promises.readFile(p, "utf8");
    const oldAccountData = JSON.parse(f);
    console.log(oldAccountData);
    console.log(nextAccountData);
    const nextState = JSON.stringify({ ...oldAccountData, ...nextAccountData });

    return await fs.promises.writeFile(p, nextState, "utf8");
  });

  ipcMain.handle("get-config", async (event, data) => {
    const p = path.join(__dirname, ".wallet", "config.json");
    const f = await fs.promises.readFile(p, "utf8");

    return JSON.parse(f);
  });

  ipcMain.handle("write-config", async (event, nextConfig) => {
    const p = path.join(__dirname, ".wallet", "config.json");
    const f = await fs.promises.readFile(p, "utf8");
    const oldConfig = JSON.parse(f);
    const nextState = JSON.stringify({ ...oldConfig, ...nextConfig });

    return await fs.promises.writeFile(p, nextState, "utf8");
  });

  ipcMain.handle("get-settings", async (event, data) => {
    const p = path.join(__dirname, ".wallet", "settings.json");
    const f = await fs.promises.readFile(p, "utf8");

    return JSON.parse(f);
  });

  ipcMain.handle("write-settings", async (event, nextSettings) => {
    const p = path.join(__dirname, ".wallet", "settings.json");
    const f = await fs.promises.readFile(p, "utf8");
    const oldSettings = JSON.parse(f);
    const nextState = JSON.stringify({ ...oldSettings, ...nextSettings });

    return await fs.promises.writeFile(p, nextState, "utf8");
  });

  const pathRoot = path.join(__dirname, ".wallet");

  // NOTE(jim): Enable this line
  // if you need to wipe your state.
  // await fs.promises.rmdir(pathRoot, { recursive: true });

  const pathSettings = path.join(__dirname, ".wallet", "settings.json");
  const pathConfig = path.join(__dirname, ".wallet", "config.json");
  const pathAccounts = path.join(__dirname, ".wallet", "accounts.json");

  const maybeRootExists = await fs.existsSync(pathRoot);
  if (!maybeRootExists) {
    await fs.promises.mkdir(pathRoot);
  }

  const maybeSettingsExists = await fs.existsSync(pathSettings);
  if (!maybeSettingsExists) {
    await fs.promises.writeFile(pathSettings, JSON.stringify(NEW_DEFAULT_SETTINGS), {
      encoding: "utf8",
    });
  }

  const maybeConfigExists = await fs.existsSync(pathConfig);
  if (!maybeConfigExists) {
    await fs.promises.writeFile(pathConfig, JSON.stringify(NEW_DEFAULT_CONFIG), {
      encoding: "utf8",
    });
  }

  const maybeAccountsExist = await fs.existsSync(pathAccounts);
  if (!maybeAccountsExist) {
    await fs.promises.writeFile(pathAccounts, JSON.stringify(NEW_DEFAULT_ACCOUNTS), {
      encoding: "utf8",
    });
  }

  const configJSON = await fs.promises.readFile(pathConfig, "utf8");
  const config = JSON.parse(configJSON);

  const settingsJSON = await fs.promises.readFile(pathSettings, "utf8");
  const settings = JSON.parse(settingsJSON);

  provider = new NodejsProvider(config.API_URL);
  client = new LotusRPC(provider, { schema: mainnet.fullNode });

  const filecoinNumber = new FilecoinNumber("10000", "attoFil");

  console.log(`Testing Values: ${filecoinNumber.toPicoFil()} PICO FIL`);
  console.log(`Testing Values: ${filecoinNumber.toAttoFil()} ATTO FIL`);
  console.log(`Testing Values: ${filecoinNumber.toFil()} FIL`);

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
