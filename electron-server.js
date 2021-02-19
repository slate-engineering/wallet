import * as Utilities from "~/src/common/utilities";
import * as ActorMethods from "~/src/common/actor-methods";

import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import { mainnet } from "@filecoin-shipyard/lotus-client-schema";
import { Converter, FilecoinNumber } from "@glif/filecoin-number";
import { app, BrowserWindow, remote, ipcMain, protocol } from "electron";

import TransportNodeHID from "@ledgerhq/hw-transport-node-hid";
import FilecoinApp from "@zondax/ledger-filecoin";
import FilecoinSigning from "@zondax/filecoin-signing-tools";
import fetch from "node-fetch";
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
let msgCache = null;
let codeCache = null;

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

const APPLICATION_DATA_PATH = (app || remote.app).getPath("userData");
console.log(APPLICATION_DATA_PATH);

const icon = path.join(__dirname, "build", "icons", "mac", "icon.icns");
console.log({ icon });

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: "hiddenInset",
    width: 768,
    height: 604,
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

const MULTI_SIG_ACTOR_ID = "bafkqadtgnfwc6mrpnv2wy5djonuwo";

app.on("ready", async () => {
  ipcMain.handle("get-balance", async (event, address) => {
    console.log("getting balance ...");
    console.log("starting get-balance request...", { address });
    let type = 0;
    if (address.startsWith("f1")) {
      type = 1;
    }
    if (address.startsWith("f3")) {
      type = 3;
    }

    try {
      const actor = await client.stateGetActor(address, []);
      console.log("got-balance...", { actor });

      if (address.startsWith("f2")) {
        if (actor.Code["/"] === MULTI_SIG_ACTOR_ID) {
          type = 2;
        }
      }

      if (type === 0) {
        return { error: "Not a valid address for this wallet." };
      }

      return {
        result: {
          balance: actor.Balance,
          timestamp: new Date(),
          type,
        },
      };
    } catch (e) {
      if (e.toString().includes("actor not found")) {
        return {
          result: {
            balance: "0",
            timestamp: new Date(),
            type,
          },
        };
      }
      return {
        error: e.toString(),
      };
    }
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

  ipcMain.handle("get-transactions-as-array", async (event, address) => {
    console.log("getting transactions for", address);

    const p = path.join(APPLICATION_DATA_PATH, ".wallet", "config.json");
    const f = await fs.promises.readFile(p, "utf8");
    const c = JSON.parse(f);

    console.log({ c });

    try {
      const resp = await fetch(c.INDEX_URL + "/index/msgs/for/" + address);
      const json = await resp.json();
      console.log(json);

      return json.length ? json : [];
    } catch (e) {
      console.log(e);
      return [];
    }
  });

  ipcMain.handle("get-actor-code", async (event, address) => {
    try {
      const cached = codeCache.getKey(address);
      if (cached) {
        return {
          result: cached,
        };
      }

      const actor = await client.stateGetActor(address, []);

      msgCache.setKey(address, actor.Code);
      msgCache.save(true);
      return {
        result: actor.Code,
      };
    } catch (e) {
      return {
        error: e.toString(),
      };
    }
  });

  ipcMain.handle("get-message", async (event, mcid) => {
    try {
      const cached = msgCache.getKey(mcid);
      if (cached) {
        return {
          result: cached,
        };
      }

      const msg = await client.chainGetMessage({ "/": mcid });

      msgCache.setKey(mcid, msg);
      msgCache.save(true);
      return {
        result: msg,
      };
    } catch (e) {
      return {
        error: e.toString(),
      };
    }
  });

  ipcMain.handle("deserialize-params", async (event, params, code, method) => {
    try {
      const actorInfo = ActorMethods.actorsByCode[code];
      if (!actorInfo) {
        return {
          error: "unknown actor code cid: " + code,
        };
      }
      const decoded = FilecoinSigning.deserializeParams(params, actorInfo.cidText, method);
      return {
        result: decoded,
      };
    } catch (e) {
      return {
        error: e.toString(),
      };
    }
  });

  ipcMain.handle("serialize-params", async (event, params) => {
    try {
      const encoded = FilecoinSigning.serializeParams(params);
      return {
        result: encoded,
      };
    } catch (e) {
      return {
        error: e.toString(),
      };
    }
  });

  ipcMain.handle("signing-propose-multisig", async (event, msig, destination, signer, value) => {
    // TODO: this could just be done clientside if we could figure out how to import the library there
    const actor = await client.stateGetActor(signer, []);

    const msg = FilecoinSigning.proposeMultisig(msig, destination, signer, value, actor.Nonce);

    return {
      result: msg,
    };
  });

  ipcMain.handle("sign-message", async (event, signer, message) => {
    try {
      let sender = message.from;
      if (sender.startsWith("f0")) {
        // ID form address used, lets normalize to pubkey form to make checking
        // things easier
        sender = await client.stateAccountKey(sender, []);
      }

      if (signer.type == 1 && !Utilities.isEmpty(signer.path)) {
        let pathForSender = signer.path;
        if (transport == null) {
          transport = await TransportNodeHID.open(""); // TODO: pull this out into a shared 'getTransport' func
        }

        console.log("about to sign: ", message);
        console.log("path: ", pathForSender);

        if (message.params == null) {
          message.params = "";
        }
        const serialized = await FilecoinSigning.transactionSerialize(message);
        /*
        const signature = await FilecoinSigning.transactionSignRawWithDevice(
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

  ipcMain.handle("get-multisig-info", async (event, addr) => {
    try {
      const actor = await client.stateGetActor(addr, []);

      if (actor.Code["/"] !== "bafkqadtgnfwc6mrpnv2wy5djonuwo") {
        return {
          error: addr + " is not a multisig account",
        };
      }
    } catch (e) {
      return {
        error: e.toString(),
      };
    }

    let out = null;
    try {
      const resp = await client.stateReadState(addr, []);
      const state = resp.State;
      out = {
        balance: resp.Balance,
        signers: state.Signers,
        threshold: state.NumApprovalsThreshold,
        next_txn_id: state.NextTxnID,
        vesting_start: state.StartEpoch,
        vesting_duration: state.UnlockDuration,
        vesting_balance: state.InitialBalance,
      };
    } catch (e) {
      return {
        error: e.toString(),
      };
    }

    try {
      out.pending = await client.msigGetPending(addr, []);
    } catch (e) {
      return {
        error: "get pending failed: " + e.toString(),
      };
    }

    return {
      result: {
        balance: out.balance,
        signers: out.signers,
        threshold: out.threshold,
        next_txn_id: out.next_txn_id,
        vesting_start: out.vesting_start,
        vesting_duration: out.vesting_duration,
        vesting_balance: out.vesting_balance,
        pending: out.pending,
      },
    };
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
        transport = await TransportNodeHID.open("");
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
        transport = await TransportNodeHID.open("");
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

  ipcMain.handle("resolve-address", async (event, address) => {
    if (address.startsWith("f0")) {
      try {
        // TODO: this wont work if someone passes in the ID address of a
        // multisig wallet... need to figure out how to work around this...
        const resp = await client.stateAccountKey(address, []);
        return {
          addressId: address,
          address: resp,
        };
      } catch (e) {
        // TODO: there is a case where some addresses *only* have an f0 address
        // if they were created in the genesis block
        return {
          error: e.toString(),
        };
      }
    } else {
      try {
        const resp = await client.stateLookupID(address, []);
        return {
          result: {
            addressId: resp,
            address: address,
          },
        };
      } catch (e) {
        return {
          error: e.toString(),
        };
      }
    }
  });

  ipcMain.handle("get-accounts", async (event) => {
    try {
      const p = path.join(APPLICATION_DATA_PATH, ".wallet", "accounts.json");
      const f = await fs.promises.readFile(p, "utf8");

      return JSON.parse(f);
    } catch (e) {
      console.log(e);
      return { error: "get-accounts error" };
    }
  });

  ipcMain.handle("write-accounts", async (event, nextAccountData) => {
    try {
      const p = path.join(APPLICATION_DATA_PATH, ".wallet", "accounts.json");
      const f = await fs.promises.readFile(p, "utf8");
      const oldAccountData = JSON.parse(f);
      console.log("old", oldAccountData);
      console.log("new", nextAccountData);
      const nextState = JSON.stringify({ ...oldAccountData, ...nextAccountData });

      await fs.promises.writeFile(p, nextState, "utf8");

      return { success: true };
    } catch (e) {
      console.log(e);
      return { error: "write-accounts error" };
    }
  });

  ipcMain.handle("get-config", async (event, data) => {
    try {
      const p = path.join(APPLICATION_DATA_PATH, ".wallet", "config.json");
      const f = await fs.promises.readFile(p, "utf8");

      return JSON.parse(f);
    } catch (e) {
      console.log(e);
      return { error: "get-config error" };
    }
  });

  ipcMain.handle("write-config", async (event, nextConfig) => {
    try {
      const p = path.join(APPLICATION_DATA_PATH, ".wallet", "config.json");
      const f = await fs.promises.readFile(p, "utf8");
      const oldConfig = JSON.parse(f);
      const updates = { ...oldConfig, ...nextConfig };
      const nextState = JSON.stringify(updates);
      await fs.promises.writeFile(p, nextState, "utf8");

      provider = new NodejsProvider(updates.API_URL);
      // TODO(why):
      // Hack until a patch is made.
      mainnet.fullNode.methods.MsigGetPending = {};
      client = new LotusRPC(provider, { schema: mainnet.fullNode });

      return { ...updates };
    } catch (e) {
      console.log(e);
      return { error: "write-config error" };
    }
  });

  ipcMain.handle("get-settings", async (event, data) => {
    try {
      const p = path.join(APPLICATION_DATA_PATH, ".wallet", "settings.json");
      const f = await fs.promises.readFile(p, "utf8");

      return JSON.parse(f);
    } catch (e) {
      console.log(e);
      return { error: "get-settings error" };
    }
  });

  ipcMain.handle("write-settings", async (event, nextSettings) => {
    try {
      const p = path.join(APPLICATION_DATA_PATH, ".wallet", "settings.json");
      const f = await fs.promises.readFile(p, "utf8");
      const oldSettings = JSON.parse(f);
      const updates = { ...oldSettings, ...nextSettings };
      const nextState = JSON.stringify(updates);

      await fs.promises.writeFile(p, nextState, "utf8");

      return { ...updates };
    } catch (e) {
      return { error: "write-settings error" };
    }
  });

  const pathRoot = path.join(APPLICATION_DATA_PATH, ".wallet");

  // NOTE(jim): Enable this line
  // if you need to wipe your state.
  // await fs.promises.rmdir(pathRoot, { recursive: true });

  const pathSettings = path.join(APPLICATION_DATA_PATH, ".wallet", "settings.json");
  const pathConfig = path.join(APPLICATION_DATA_PATH, ".wallet", "config.json");
  const pathAccounts = path.join(APPLICATION_DATA_PATH, ".wallet", "accounts.json");

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
  mainnet.fullNode.methods.MsigGetPending = {}; // Temporary hack until dep gets updated
  client = new LotusRPC(provider, { schema: mainnet.fullNode });

  // NOTE(jim):
  // Electron demands that the cache paths are in a specific directory.
  const cachePath = path.join(APPLICATION_DATA_PATH, "cache");
  const maybeCachePathExists = await fs.existsSync(cachePath);
  if (!maybeCachePathExists) {
    console.log("Creating cache root...", cachePath);
    await fs.promises.mkdir(cachePath);
  }

  const messageCachePath = path.join(APPLICATION_DATA_PATH, "cache", "msg");
  const maybeMessageCacheExists = await fs.existsSync(messageCachePath);
  if (!maybeMessageCacheExists) {
    console.log("Creating cache message folder...", messageCachePath);
    await fs.promises.mkdir(messageCachePath);
  }

  const codeCachePath = path.join(APPLICATION_DATA_PATH, "cache", "code");
  const maybeCodeCacheExists = await fs.existsSync(codeCachePath);
  if (!maybeCodeCacheExists) {
    console.log("Creating code cache folder...", codeCachePath);
    await fs.promises.mkdir(codeCachePath);
  }

  // NOTE(jim):
  // We can force flat-cache to use a specific directory.
  console.log("Loading message cache...", messageCachePath);
  msgCache = flatCache.load("msgcache", messageCachePath);
  console.log("Loading code cache...", codeCachePath);
  codeCache = flatCache.load("codecache", codeCachePath);

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
