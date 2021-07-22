import * as ActorMethods from "~/src/common/actor-methods";
import * as HandlersUtilities from "~/src/common/handlers-utilities";
import * as Utilities from "~/src/common/utilities";

import path from "path";
import fs from "fs";
import TransportNodeHID from "@ledgerhq/hw-transport-node-hid";
import FilecoinApp from "@zondax/ledger-filecoin";
import FilecoinSigning from "@zondax/filecoin-signing-tools";

import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import { mainnet } from "@filecoin-shipyard/lotus-client-schema";

const MULTI_SIG_ACTOR_ID = "bafkqadtgnfwc6njpnv2wy5djonuwo";

const getAccounts = {
  key: "get-accounts",
  method: async (event) => {
    try {
      console.log("get-accounts ... ");
      const f = await fs.promises.readFile(global.memory.paths.accounts, "utf8");
      return JSON.parse(f);
    } catch (e) {
      console.log(e);
      return { error: "get-accounts error" };
    }
  },
};

const writeAccounts = {
  key: "write-accounts",
  method: async (event, nextAccountData) => {
    try {
      console.log("write-accounts ... ", nextAccountData);
      const f = await fs.promises.readFile(global.memory.paths.accounts, "utf8");
      const oldAccountData = JSON.parse(f);
      const updates = { ...oldAccountData, ...nextAccountData };
      const nextState = JSON.stringify(updates);
      await fs.promises.writeFile(global.memory.paths.accounts, nextState, "utf8");
      return { ...updates };
    } catch (e) {
      console.log(e);
      return { error: "write-accounts error" };
    }
  },
};

const getSettings = {
  key: "get-settings",
  method: async (event, data) => {
    try {
      console.log("get-settings ... ");
      const settings = await fs.promises.readFile(global.memory.paths.settings, "utf8");
      return JSON.parse(settings);
    } catch (e) {
      console.log(e);
      return { error: "get-settings error" };
    }
  },
};

const writeSettings = {
  key: "write-settings",
  method: async (event, nextSettings) => {
    try {
      console.log("write-settings ... ");
      const f = await fs.promises.readFile(global.memory.paths.settings, "utf8");
      const oldSettings = JSON.parse(f);
      const updates = { ...oldSettings, ...nextSettings };
      const nextState = JSON.stringify(updates);
      await fs.promises.writeFile(global.memory.paths.settings, nextState, "utf8");
      return { ...updates };
    } catch (e) {
      console.log(e);
      return { error: "write-settings error" };
    }
  },
};

const getConfig = {
  key: "get-config",
  method: async (event, data) => {
    try {
      console.log("get-config ... ");
      const config = await fs.promises.readFile(global.memory.paths.config, "utf8");
      return JSON.parse(config);
    } catch (e) {
      console.log(e);
      return { error: "get-config error" };
    }
  },
};

const writeConfig = {
  key: "write-config",
  method: async (event, nextConfig) => {
    try {
      console.log("write-config ... ");
      const configJSON = await fs.promises.readFile(global.memory.paths.config, "utf8");
      const oldConfig = JSON.parse(configJSON);
      const updates = { ...oldConfig, ...nextConfig };
      const nextState = JSON.stringify(updates);
      await fs.promises.writeFile(global.memory.paths.config, nextState, "utf8");

      return { ...updates };
    } catch (e) {
      console.log(e);
      return { error: "write-config error" };
    }
  },
};

const estimateGas = {
  key: "estimate-gas",
  method: async (event, message) => {
    console.log("estimate-gas ... ", { message });
    const client = await HandlersUtilities.getClient();
    let e = await client.gasEstimateMessageGas(message, {}, []);

    return {
      version: e.Version,
      from: e.From,
      to: e.To,
      value: e.Value,
      nonce: e.Nonce,
      method: e.Method,
      params: e.Params,
      gasFeeCap: e.GasFeeCap,
      gasLimit: e.GasLimit,
      gasPremium: e.GasPremium,
    };
  },
};

const getActor = {
  key: "get-actor",
  method: async (event, address) => {
    try {
      console.log("get-actor ... ", { address });
      const client = await HandlersUtilities.getClient();
      const actor = await client.stateGetActor(address, []);
      return {
        nonce: actor.Nonce,
        balance: actor.Balance,
        code: actor.Code,
        head: actor.Head,
      };
    } catch (e) {
      console.log(e);
      return { error: "get-actor error" };
    }
  },
};

const getActorCode = {
  key: "get-actor-code",
  method: async (event, address) => {
    try {
      console.log("get-actor-code ...", { address });
      const client = await HandlersUtilities.getClient();
      const cached = global.memory.caches.code.getKey(address);
      if (cached) {
        return {
          result: cached,
        };
      }

      const actor = await client.stateGetActor(address, []);

      global.memory.caches.message.setKey(address, actor.Code);
      global.memory.caches.message.save(true);
      return {
        result: actor.Code,
      };
    } catch (e) {
      return {
        error: e.toString(),
      };
    }
  },
};

const getMessage = {
  key: "get-message",
  method: async (event, mcid) => {
    try {
      console.log("get-message ... ", mcid);
      const client = await HandlersUtilities.getClient();
      const cached = global.memory.caches.message.getKey(mcid);
      if (cached) {
        return {
          result: cached,
        };
      }

      const msg = await client.chainGetMessage({ "/": mcid });

      global.memory.caches.message.setKey(mcid, msg);
      global.memory.caches.message.save(true);
      return {
        result: msg,
      };
    } catch (e) {
      console.log(e);
      return {
        error: e.toString(),
      };
    }
  },
};

const getBalance = {
  key: "get-balance",
  method: async (event, address) => {
    let type = 0;
    try {
      console.log("get-balance ...", { address });
      const client = await HandlersUtilities.getClient();
      if (address.startsWith("f1")) {
        type = 1;
      }
      if (address.startsWith("f3")) {
        type = 3;
      }

      const actor = await client.stateGetActor(address, []);
      console.log("get-balance result ...", { actor });
      if (address.startsWith("f0") || address.startsWith("f2")) {
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
      console.log(e);
      // NOTE(jim): Brittle error.
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
  },
};

const resolveAddress = {
  key: "resolve-address",
  method: async (event, address) => {
    console.log("resolve-address ... ", { address });
    const client = await HandlersUtilities.getClient();

    if (address.startsWith("f0")) {
      try {
        // TODO(why): this wont work if someone passes in the ID address of a
        // multisig wallet... need to figure out how to work around this...
        const resp = await client.stateAccountKey(address, []);
        return {
          addressId: address,
          address: resp,
        };
      } catch (e) {
        // TODO(why): there is a case where some addresses *only* have an f0 address
        // if they were created in the genesis block
        console.log(e);
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
        console.log(e);
        return {
          error: e.toString(),
        };
      }
    }
  },
};

const deserializeParams = {
  key: "deserialize-params",
  method: async (event, params, code, method) => {
    console.log("deserialize-params ... ", { params, code, method });
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
      console.log(e);
      return {
        error: e.toString(),
      };
    }
  },
};

const serializeParams = {
  key: "serialize-params",
  method: async (event, params) => {
    console.log("serialize-params ... ", { params });
    try {
      const encoded = FilecoinSigning.serializeParams(params);
      return {
        result: encoded,
      };
    } catch (e) {
      console.log(e);
      return {
        error: e.toString(),
      };
    }
  },
};

// proposal ui
// proposal response
const signingProposeMultisig = {
  key: "signing-propose-multisig",
  method: async (event, msig, destination, signer, value) => {
    try {
      console.log("signing-propose-multisig ... ", { msig, destination, signer, value });
      const client = await HandlersUtilities.getClient();

      // TODO(why): this could just be done clientside if we could
      // figure out how to import the library there
      const actor = await client.stateGetActor(signer, []);

      const msg = FilecoinSigning.proposeMultisig(msig, destination, signer, value, actor.Nonce);
      return {
        result: msg,
      };
    } catch (e) {
      console.log(e);
      return { error: e.toString() };
    }
  },
};

const signMessage = {
  key: "sign-message",
  method: async (event, signer, message) => {
    try {
      console.log("sign-message ... ", { signer, message });
      const client = await HandlersUtilities.getClient();
      let sender = message.from;
      if (sender.startsWith("f0")) {
        // NOTE(why)
        // ID form address used, lets normalize to pubkey form to make checking
        // things easier
        sender = await client.stateAccountKey(sender, []);
      }

      if (signer.type == 1 && !Utilities.isEmpty(signer.path)) {
        let pathForSender = signer.path;
        if (!global.memory.transport) {
          return {
            error: "There is no ledger connection open.",
          };
        }

        console.log("sign-message ... about to sign ... ", { message });
        console.log("sign-message ... path ... ", { pathForSender });
        if (!message.params) {
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
        console.log("sign-message ... serialized ...", { serialized });

        let serbuf = new Buffer(serialized, "hex");
        const app = new FilecoinApp(global.memory.transport);
        const sigResp = await app.sign(pathForSender, serbuf);

        console.log("sign-message ... signature response ... ", { sigResp });
        if (sigResp.return_code != 0x9000) {
          return {
            error: sigResp.error_message,
          };
        }

        console.log("sign-message ... signature response ... ", { sigResp });
        let signedMessage = {
          message: message,
          signature: {
            type: 1,
            data: sigResp.signature_compact.toString("base64"),
          },
        };

        let mcid = await client.mpoolPush(signedMessage);

        console.log("sign-message ... pushed message with cid ... ", { mcid });

        return { result: mcid };
      }

      return { error: "unable to sign with address" };
    } catch (e) {
      global.memory.transport = null;
      console.log(e);
      return { error: e.toString() };
    }
  },
};

// Multisig
// You need this to get signers.
const getMultiSigInfo = {
  key: "get-multisig-info",
  method: async (event, data) => {
    try {
      console.log("get-multisig-info", { data });
      const client = await HandlersUtilities.getClient();
      const actor = await client.stateGetActor(data.address, []);
      console.log("get-multisig-info... actor ... ", actor);
      if (actor.Code["/"] !== MULTI_SIG_ACTOR_ID) {
        return {
          error: `${data.address} is not a multisig account`,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        error: e.toString(),
      };
    }

    const client = await HandlersUtilities.getClient();
    let out = null;
    try {
      const resp = await client.stateReadState(data.address, []);
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
      console.log(e);
      return {
        error: e.toString(),
      };
    }

    try {
      out.pending = await client.msigGetPending(data.address, []);
    } catch (e) {
      console.log(e);
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
  },
};

const getLedgerVersion = {
  key: "get-ledger-version",
  method: async (event) => {
    try {
      console.log("get-ledger-version ... ");
      if (!global.memory.transport) {
        global.memory.transport = await TransportNodeHID.open("");
      }

      const app = new FilecoinApp(global.memory.transport);
      const version = await app.getVersion();
      console.log("get-ledger-version ... ", { version });
      return {
        result: version,
      };
    } catch (e) {
      global.memory.transport = null;
      console.log("get-ledger-version error ... ", e);
      return {
        error: e.toString(),
      };
    }
  },
};

const getLedgerAddress = {
  key: "get-ledger-address",
  method: async (event, path) => {
    try {
      if (!global.memory.transport) {
        return {
          error: "There is no ledger connection open.",
        };
      }
      const app = new FilecoinApp(global.memory.transport);
      const addrInfo = await app.getAddressAndPubKey(path);
      console.log("get-ledger-address ... ", { addrInfo });
      return {
        result: addrInfo,
      };
    } catch (e) {
      global.memory.transport = null;
      console.log("get-ledger-address error ... ", e);
      return {
        error: e.toString(),
      };
    }
  },
};

const getTransactionsAsArray = {
  key: "get-transactions-as-array",
  method: async (event) => {
    try {
      console.log("get-transactions-as-array ... noop ... ");
      return [];
    } catch (e) {
      console.log(e);
      return {
        error: "method does nothing",
      };
    }
  },
};

const handlers = [
  getAccounts,
  writeAccounts,
  getSettings,
  writeSettings,
  getConfig,
  writeConfig,
  estimateGas,
  getActor,
  getActorCode,
  getBalance,
  resolveAddress,
  deserializeParams,
  serializeParams,
  signingProposeMultisig,
  signMessage,
  getMultiSigInfo,
  getLedgerVersion,
  getLedgerAddress,
  // TODO
  getTransactionsAsArray,
];

export default handlers;
