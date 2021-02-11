import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as Constants from "~/src/common/constants";

import QRCode from "qrcode.react";
import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
import Transactions from "~/src/components/Transactions.js";

import { ipcRenderer } from "electron";

export default class SceneAddressMultisig extends React.Component {
  render() {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

    let signers = [];
    if (address.msigInfo && address.msigInfo.signers) {
      signers = address.msigInfo.signers;
    }

    let pending = [];
    if (address.msigInfo && address.msigInfo.pending) {
      pending = address.msigInfo.pending;
    }

    console.log(address);
    console.log(pending);

    return (
      <div className="scene">
        <div className="scene-multisig-layout">
          <div className="scene-multisig-layout-left">
            <div className="scene-multisig-title">Signers</div>

            <div className="scene-multisig-box">
              {signers.map((each) => (
                <div key={each} className="scene-multisig-box-item">
                  {each}
                </div>
              ))}
            </div>

            <div className="scene-multisig-title" style={{ marginTop: 48 }}>
              Pending
            </div>

            <div className="scene-multisig-box">
              {pending.map((each) => (
                <div key={each} className="scene-multisig-box-item">
                  this address approved: {each.Approved[0]} this address its where its going:{" "}
                  {each.To} {Utilities.formatAsFilecoinConversion(each.Value)}
                </div>
              ))}
            </div>
          </div>

          <div className="scene-multisig-layout-right">
            <div className="scene-multisig-title" style={{ marginTop: 43 }}>
              Account Information
            </div>
          </div>
        </div>
      </div>
    );
  }
}
