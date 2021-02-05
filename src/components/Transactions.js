import "~/src/components/Transactions.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import { ipcRenderer } from "electron";

class TransactionRow extends React.Component {
  state = {
    txn: this.props.txn,
    msg: null,
  };

  async componentDidMount() {
    const msg = await this.props.onGetMessage(this.state.txn.cid);

    this.setState({
      msg: msg,
    });
  }

  render() {
    const toElement =
      this.state.txn.to === this.props.address.address
        ? this.props.address.alias
        : this.state.txn.to;
    const fromElement =
      this.state.txn.from === this.props.address.address
        ? this.props.address.alias
        : this.state.txn.from;

    return (
      <tr className="transactions-row">
        <td className="transactions-row-data">{this.state.txn.cid}</td>
        <td className="transactions-row-data">{toElement}</td>
        <td className="transactions-row-data">{fromElement}</td>
        <td className="transactions-row-data">
          {this.state.msg ? (
            <React.Fragment>
              Value:{" "}
              {Utilities.isEmpty(this.state.msg.Value) ? "No message." : this.state.msg.Value}{" "}
              ExitCode: {this.state.txn.receipt.exit_code}
            </React.Fragment>
          ) : null}
        </td>
      </tr>
    );
  }
}

export default class TransactionList extends React.Component {
  render() {
    const items = this.props.address.transactions.map((txn) => {
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
        />
      );
    });

    return (
      <table className="transactions">
        <tr className="transactions-row">
          <th className="transactions-row-heading">CID</th>
          <th className="transactions-row-heading">TO</th>
          <th className="transactions-row-heading">FROM</th>
          <th className="transactions-row-heading"></th>
        </tr>
        {items}
      </table>
    );
  }
}
