export const multisig = {
  1: "Constructor",
  2: "Propose",
  3: "Approve",
  4: "Cancel",
  5: "AddSigner",
  6: "RemoveSigner",
  7: "SwapSigner",
  8: "ChangeNumApprovalsThreshold",
  9: "LockBalance",
};

export const market = {
  1: "Constructor",
  2: "AddBalance",
  3: "WithdrawBalance",
  4: "PublishStorageDeals",
  5: "VerifyDealsForActivation",
  6: "ActivateDeals",
  7: "OnMinerSectorsTerminate",
  8: "ComputeDataCommitment",
  9: "CronTick",
};

export const miner = {
  1: "Constructor",
  2: "ControlAddresses",
  3: "ChangeWorkerAddress",
  4: "ChangePeerID",
  5: "SubmitWindowedPoSt",
  6: "PreCommitSector",
  7: "ProveCommitSector",
  8: "ExtendSectorExpiration",
  9: "TerminateSectors",
  10: "DeclareFaults",
  11: "DeclareFaultsRecovered",
  12: "OnDeferredCronEvent",
  13: "CheckSectorProven",
  14: "ApplyRewards",
  15: "ReportConsensusFault",
  16: "WithdrawBalance",
  17: "ConfirmSectorProofsValid",
  18: "ChangeMultiaddrs",
  19: "CompactPartitions",
  20: "CompactSectorNumbers",
  21: "ConfirmUpdateWorkerKey",
  22: "RepayDebt",
  23: "ChangeOwnerAddress",
  24: "DisputeWindowedPoSt",
};

export const power = {
  1: "Constructor",
  2: "CreateMiner",
  3: "UpdateClaimedPower",
  4: "EnrollCronEvent",
  5: "OnEpochTickEnd",
  6: "UpdatePledgeTotal",
  8: "SubmitPoRepForBulkVerify",
  9: "CurrentTotalPower",
};

export const reward = {
  1: "Constructor",
  2: "AwardBlockReward",
  3: "ThisEpochReward",
  4: "UpdateNetworkKPI",
};

export const init = {
  1: "Constructor",
  2: "Exec",
};

export const actorsByCode = {
  bafkqactgnfwc6mrpnfxgs5a: {
    name: "init",
    methods: init,
  },
  bafkqaddgnfwc6mrpojsxoylsmq: {
    name: "reward",
    methods: reward,
  },
  bafkqaetgnfwc6mrpon2g64tbm5sxa33xmvza: {
    name: "power",
    methods: power,
  },
  bafkqae3gnfwc6mrpon2g64tbm5sw2ylsnnsxi: {
    name: "market",
    methods: market,
  },
  bafkqadlgnfwc6mrpmfrwg33vnz2a: {
    name: "multisig",
    methods: multisig,
  },
  bafkqaetgnfwc6mrpon2g64tbm5sw22lomvza: {
    name: "miner",
    methods: miner,
  },
};

export function isMultisig(code) {
  if (!code) {
    return false;
  }
  const act = actorsByCode[code];
  return act && act.name === "multisig";
}
