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
    return (
      <li>
        <p>Cid: {this.state.txn.cid}</p>
        <p>
          To: {this.state.txn.to} From: {this.state.txn.from}
        </p>
        {this.state.msg != null ? (
          <p>
            Value: {this.state.msg.Value} ExitCode: {this.state.txn.receipt.exit_code}
          </p>
        ) : null}
      </li>
    );
  }
}

export default class TransactionList extends React.Component {
  state = {
    txns: [],
    address: this.props.address,
  };

  async componentDidMount() {
    const txns = await ipcRenderer.invoke("get-transactions", this.state.address);

    this.setState({
      txns: txns,
    });
  }

  render() {
    const items = this.state.txns.map((txn) => {
      return <TransactionRow onGetMessage={this.props.onGetMessage} key={txn.cid} txn={txn} />;
    });
    return <ul>{items}</ul>;
  }
}
