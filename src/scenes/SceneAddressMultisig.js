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

    console.log(address);

    return (
      <div className="scene">
        <div className="scene-multisig-layout">
          <div className="scene-multisig-layout-left">
            <div className="scene-multisig-title">Signers</div>

            <div className="scene-multisig-title" style={{ marginTop: 48 }}>
              Pending
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
