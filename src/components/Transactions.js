import "~/src/components/Transactions.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as ActorMethods from "~/src/common/actor-methods";

import { Converter, FilecoinNumber } from "@glif/filecoin-number";
import { ipcRenderer } from "electron";

class ParamsInfo extends React.Component {
  render() {
    const actorInfo = ActorMethods.actorsByCode[this.props.code["/"]];
    if (!actorInfo) {
      return null;
    }

    const methodName = actorInfo.methods[this.props.msg.Method];

    if (methodName == "Propose") {
      const filval = new FilecoinNumber(this.props.params.value, "attoFIL").toFil();
      return (
        <div>
          Propose sending {filval} FIL to {this.props.params.to}
        </div>
      );
    }

    return <div>{methodName}</div>;
  }
}

class TransactionRow extends React.Component {
  static defaultProps = {
    onGetMessage: () => {
      return {
        error: "onGetMessage does not exist",
      };
    },
    onGetActorCode: () => {
      return {
        error: "onGetActorCode does not exist",
      };
    },
  };

  state = {
    txn: this.props.txn,
    msg: null,
    code: null,
  };

  async componentDidMount() {
    const msg = await this.props.onGetMessage(this.state.txn.cid);

    if (msg.error) {
      console.error("failed to get message: ", this.state.txn.cid, msg.error);
      return;
    }

    const code = await this.props.onGetActorCode(this.state.txn.to);
    if (code.error) {
      console.error("failed to get actor code: ", this.state.txn.to, code.error);
      return;
    }

    let params;

    if (msg.result.Params) {
      let mparams = msg.result.Params;
      let method = msg.result.Method;
      const deser = await this.props.onDeserializeParams(mparams, code.result, method);
      if (deser.error) {
        console.error("failed to deserialize params: ", mparams, code.result, method, deser.error);
        return;
      }
      params = deser.result;
    }

    this.setState({
      msg: msg.result,
      code: code.result,
      params: params,
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
          {this.state.msg ? <span className="tag tag--value">{value}</span> : null}
        </div>
        {this.state.msg ? (
          <ParamsInfo msg={this.state.msg} code={this.state.code} params={this.state.params} />
        ) : null}
        {/* <div className="transactions-row-cid">{this.state.txn.cid}</div> */}
      </div>
    );
  }
}

export default class Transaction extends React.Component {
  static defaultProps = {
    onGetMessage: () => {
      return {
        error: "onGetMessage does not exist",
      };
    },
    onGetActorCode: () => {
      return {
        error: "onGetActorCode does not exist",
      };
    },
  };

  render() {
    console.log(this.props.onGetActorCode);

    const txns = this.props.address.transactions ?? [];
    const items = txns.map((txn, index) => {
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
          onGetActorCode={this.props.onGetActorCode}
          onDeserializeParams={this.props.onDeserializeParams}
          key={`transactions-${index}-${txn.cid}`}
          txn={txn}
          address={this.props.address}
          accounts={this.props.accounts}
        />
      );
    });

    return <div className="transactions">{items}</div>;
  }
}
