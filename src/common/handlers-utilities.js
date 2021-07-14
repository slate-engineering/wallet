import fs from "fs";

import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import { mainnet } from "@filecoin-shipyard/lotus-client-schema";

export const getClient = async () => {
  const configJSON = await fs.promises.readFile(global.memory.paths.config, "utf8");
  const config = JSON.parse(configJSON);
  const provider = new NodejsProvider(config.API_URL);

  // TODO(why)
  // Temporary hack until dependency gets updated.
  mainnet.fullNode.methods.MsigGetPending = {};

  const client = new LotusRPC(provider, { schema: mainnet.fullNode });
  return client;
};
