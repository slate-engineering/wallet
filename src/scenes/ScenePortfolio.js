import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Transactions from "~/src/components/Transactions.js";

import { ipcRenderer } from "electron";

import "~/src/scenes/Scene.css";

export default class ScenePortfolio extends React.Component {
  render() {
    console.log(this.props.accounts);

    let balance = 0;
    let transactions = [];
    for (const a of this.props.accounts.addresses) {
      console.log(a);
      balance = Number(balance) + Number(a.balance);
      transactions = [...a.transactions, ...transactions];
    }

    console.log(balance);
    console.log(transactions);

    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Portfolio</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            Welcome back! Your Filecoin Balance is spread across{" "}
            {this.props.accounts.addresses.length} addresses and {transactions.length} transactions.
          </p>

          {balance > 0 ? (
            <React.Fragment>
              <h2 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.formatAsFilecoinConversion(balance)}
              </h2>
              <p className="body-paragraph">Balance</p>
            </React.Fragment>
          ) : null}

          {transactions.length ? (
            <React.Fragment>
              <h2 className="body-heading-two" style={{ marginTop: 24 }}>
                Transactions
              </h2>
              <Transactions
                accounts={this.props.accounts}
                onGetMessage={this.props.onGetMessage}
                address={{ transactions }}
              />
            </React.Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}
