import "~/src/components/Transactions.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import { Converter, FilecoinNumber } from "@glif/filecoin-number";
import { ipcRenderer } from "electron";

class TransactionRow extends React.Component {
  state = {
    txn: this.props.txn,
    msg: null,
  };

  async componentDidMount() {
    const msg = await this.props.onGetMessage(this.state.txn.cid);

    if (msg.error) {
      console.error("failed to get message: ", this.state.txn.cid, msg.error);
      return;
    }

    this.setState({
      msg: msg.result,
    });
  }

  render() {
    const toElement = Utilities.getAlias(this.state.txn.to, this.props.accounts, true);
    const fromElement = Utilities.getAlias(this.state.txn.from, this.props.accounts, true);

    let value = "No message."; // todo, better placeholder...
    if (this.state.msg) {
      let v = new FilecoinNumber(this.state.msg.Value, "attoFIL");
      value = v.toFil() + " FIL";
    }

    return (
      <div className="transactions-row">
        <div>
          {fromElement} ➟ {toElement}&nbsp;
          {this.state.msg ? value : null}
        </div>
        <div className="transactions-row-cid">{this.state.txn.cid}</div>
      </div>
    );
  }
}

export default class Transaction extends React.Component {
  render() {
    const txns = this.props.address.transactions ?? [];
    const items = txns.map((txn) => {
      if (!txn.cid) {
        console.log("invalid attempt", txn);
        return null;
      }

      if (txn.cid["/"]) {
        console.log("incorrect cid value, patching but source is still damaged");
        txn.cid = txn.cid["/"];
      }

      return (
        <TransactionRow
          onGetMessage={this.props.onGetMessage}
          key={txn.cid}
          txn={txn}
          address={this.props.address}
          accounts={this.props.accounts}
        />
      );
    });

    return <div className="transactions">{items}</div>;
  }
}
