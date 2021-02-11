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

    return <div className="scene">Multisig</div>;
  }
}
