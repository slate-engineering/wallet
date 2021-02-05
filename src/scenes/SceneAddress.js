import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
import TransactionList from "~/src/components/Transactions.js";

import { ipcRenderer } from "electron";

export default class SceneAddress extends React.Component {
  state = { refreshing: false };

  _handleRefresh = async ({ address }) => {
    this.setState({ refreshing: true });
    const response = await this.props.onRefreshAddress({ address });
    this.setState({ refreshing: false });
  };

  _handleAliasChange = (e) => {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

    this.props.onUpdateAddress({ ...address, alias: e.target.value });
  };

  render() {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

    console.log(address);

    if (!address) {
      return (
        <div className="scene">
          <div className="body">
            <h1 className="body-heading">Address not found.</h1>
            <p className="body-paragraph">Please try a different wallet address.</p>
          </div>
        </div>
      );
    }

    const hasDate = !Utilities.isEmpty(address.timestamp);
    const hasBalance = !Utilities.isEmpty(address.balance);

    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">{address.address}</h1>
          <p className="body-paragraph">Filecoin public address</p>

          {hasBalance ? (
            <React.Fragment>
              <h1 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.formatAsFilecoinConversion(address.balance)}
              </h1>
              <p className="body-paragraph">Filecoin balance (FIL)</p>
            </React.Fragment>
          ) : null}

          {hasDate ? (
            <React.Fragment>
              <h1 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.toDate(address.timestamp)}
              </h1>
              <p className="body-paragraph">Last updated</p>
            </React.Fragment>
          ) : null}

          <div style={{ marginTop: 16 }}>
            <Button
              loading={this.state.refreshing}
              onClick={() => this._handleRefresh({ address: address.address })}
            >
              Refresh
            </Button>
          </div>

          <h2 className="body-heading-two" style={{ marginTop: 48 }}>
            Transactions
          </h2>
          <TransactionList onGetMessage={this.props.onGetMessage} address={address} />

          <Input
            onChange={this._handleAliasChange}
            value={address.alias}
            name="alias"
            title="Alias"
            description="Give your address an alias to make it easier to remember."
            style={{ marginTop: 48 }}
          ></Input>

          <h2 className="body-heading-two" style={{ marginTop: 48 }}>
            Delete this address
          </h2>
          <p className="body-paragraph">
            This will remove this address from your wallet. You can add it back later.
          </p>

          <div style={{ marginTop: 24 }}>
            <Button onClick={() => this.props.onDeleteAddress({ address: address.address })}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
