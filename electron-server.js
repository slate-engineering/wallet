import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import { mainnet } from "@filecoin-shipyard/lotus-client-schema";
import { Converter, FilecoinNumber } from "@glif/filecoin-number";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import signing from "@zondax/filecoin-signing-tools";
import FilecoinApp from "@zondax/ledger-filecoin";
import { app, BrowserWindow, ipcMain, protocol } from "electron";
import fetch from "fetch";
import fs from "fs";
import path from "path";
import url from "url";

const NEW_DEFAULT_SETTINGS = {
  settings: true,
};
const NEW_DEFAULT_CONFIG = {
  config: true,
  API_URL: "wss://api.chain.love/rpc/v0",
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
    // TODO(why): can cache this in local state so we can present the user nice
    // information even when offline
    let actor = await client.stateGetActor(address, []);

    return {
      balance: actor.Balance,
      timestamp: new Date(),
    };
  });

  ipcMain.handle("get-actor", async (event, address) => {
    const actor = await client.stateGetActor(address, []);
    return {
      nonce: actor.Nonce,
      balance: actor.Balance,
      code: actor.Code,
      head: actor.Head,
    };
  });

  ipcMain.handle("get-transactions", async (event, address) => {
    const resp = await fetch(indexUrl + "/index/msgs/for/" + address);

    return resp.json();
  });

  ipcMain.handle("get-message", async (event, mcid) => {
    return await client.chainGetMessage(mcid);
  });

  ipcMain.handle("sign-message", async (event, signer, message) => {
    try {
      let sender = message.from;
      if (sender.startsWith("f0")) {
        // ID form address used, lets normalize to pubkey form to make checking
        // things easier
        sender = await client.stateAccountKey(sender, []);
      }

      if (signer.kind == "ledger") {
        let pathForSender = signer.path;
        if (transport == null) {
          transport = await TransportNodeHid.open(""); // TODO: pull this out into a shared 'getTransport' func
        }

        console.log("about to sign: ", message);
        console.log("path: ", pathForSender);

        if (message.params == null) {
          message.params = "";
        }
        const serialized = await signing.transactionSerialize(message);
        /*
        const signature = await signing.transactionSignRawWithDevice(
          message,
          pathForSender,
          transport
        );
        */
        console.log("serialized: ", serialized);

        let serbuf = new Buffer(serialized, "hex");
        const app = new FilecoinApp(transport);
        const sigResp = await app.sign(pathForSender, serbuf);

        console.log("sig resp: ", sigResp);
        if (sigResp.return_code != 0x9000) {
          return {
            error: sigResp.error_message,
          };
        }

        console.log("signature response: ", sigResp);

        let signedMessage = {
          message: message,
          signature: {
            type: 1,
            data: sigResp.signature_compact.toString("base64"),
          },
        };

        let mcid = await client.mpoolPush(signedMessage);

        console.log("pushed message with cid: ", mcid);

        return { result: mcid };
      }

      return { error: "unable to sign with address" };
    } catch (e) {
      return { error: e };
    }
  });

  ipcMain.handle("estimate-gas", async (event, message) => {
    let estim = await client.gasEstimateMessageGas(message, {}, []);

    return {
      version: estim.Version,
      from: estim.From,
      to: estim.To,
      value: estim.Value,
      nonce: estim.Nonce,
      method: estim.Method,
      params: estim.Params,
      gasFeeCap: estim.GasFeeCap,
      gasLimit: estim.GasLimit,
      gasPremium: estim.GasPremium,
    };
  });

  ipcMain.handle("get-ledger-version", async (event) => {
    try {
      if (transport == null) {
        transport = await TransportNodeHid.open("");
      }
      const app = new FilecoinApp(transport);

      const version = await app.getVersion();

      console.log(version);
      return {
        result: version,
      };
    } catch (e) {
      transport = null;
      console.log("ledger error: ", e);
      return {
        error: e.toString(),
      };
    }
  });

  ipcMain.handle("get-ledger-address", async (event, path) => {
    try {
      if (transport == null) {
        transport = await TransportNodeHid.open("");
      }
      const app = new FilecoinApp(transport);

      const addrInfo = await app.getAddressAndPubKey(path);

      return {
        result: addrInfo,
      };
    } catch (e) {
      transport = null;
      console.log("ledger error: ", e);
      return {
        error: e.toString(),
      };
    }
  });

  ipcMain.handle("get-accounts", async (event) => {
    const p = path.join(__dirname, ".wallet", "accounts.json");
    const f = await fs.promises.readFile(p, "utf8");

    return JSON.parse(f);
  });

  let writeLock = false;
  ipcMain.handle("write-accounts", async (event, nextAccountData) => {
    if (writeLock) {
      return;
    }

    writeLock = true;
    const p = path.join(__dirname, ".wallet", "accounts.json");
    const f = await fs.promises.readFile(p, "utf8");
    const oldAccountData = JSON.parse(f);
    console.log("old", oldAccountData);
    console.log("new", nextAccountData);
    const nextState = JSON.stringify({ ...oldAccountData, ...nextAccountData });

    await fs.promises.writeFile(p, nextState, "utf8");
    writeLock = false;
  });

  ipcMain.handle("get-config", async (event, data) => {
    const p = path.join(__dirname, ".wallet", "config.json");
    const f = await fs.promises.readFile(p, "utf8");

    return JSON.parse(f);
  });

  let configLock = false;
  ipcMain.handle("write-config", async (event, nextConfig) => {
    if (configLock) {
      return;
    }

    configLock = true;
    const p = path.join(__dirname, ".wallet", "config.json");
    const f = await fs.promises.readFile(p, "utf8");
    const oldConfig = JSON.parse(f);
    const nextState = JSON.stringify({ ...oldConfig, ...nextConfig });
    await fs.promises.writeFile(p, nextState, "utf8");
    configLock = false;
  });

  ipcMain.handle("get-settings", async (event, data) => {
    const p = path.join(__dirname, ".wallet", "settings.json");
    const f = await fs.promises.readFile(p, "utf8");

    return JSON.parse(f);
  });

  let settingsLock;
  ipcMain.handle("write-settings", async (event, nextSettings) => {
    if (settingsLock) {
      return;
    }

    settingsLock = true;
    const p = path.join(__dirname, ".wallet", "settings.json");
    const f = await fs.promises.readFile(p, "utf8");
    const oldSettings = JSON.parse(f);
    const nextState = JSON.stringify({ ...oldSettings, ...nextSettings });

    await fs.promises.writeFile(p, nextState, "utf8");
    settingsLock = false;
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
