import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as Constants from "~/src/common/constants";

import QRCode from "qrcode.react";
import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
import Transactions from "~/src/components/Transactions.js";
import SceneAddressMultisig from "~/src/scenes/SceneAddressMultisig";

import { ipcRenderer } from "electron";

const WALLET_ADDRESS_TYPES_SVG = {
  1: <span>◈</span>,
  2: <span>⁂</span>,
  3: <span>✢</span>,
};

const getAlias = (props) => {
  const address = props.accounts.addresses.find(
    (account) => account.address === props.context.address
  );

  return address.alias;
};

const getThreshold = (props) => {
  const address = props.accounts.addresses.find(
    (account) => account.address === props.context.address
  );

  return address.msigInfo ? address.msigInfo.threshold : null;
};

export default class SceneAddress extends React.Component {
  state = {
    refreshing: undefined,
    alias: getAlias(this.props),
    threshold: getThreshold(this.props),
  };

  componentDidUpdate(prevProps) {
    if (prevProps.context.address !== this.props.context.address) {
      this.setState({ refreshing: undefined, alias: getAlias(this.props) });
    }
  }

  _handleRefresh = async ({ address }) => {
    this.setState({ refreshing: 1 });
    const response = await this.props.onRefreshAddress({ address });
    this.setState({ refreshing: undefined });
  };

  _handleAliasChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });

    return this._handleAliasSaveDebounced();
  };

  _handleAliasSaveDebounced = Utilities.debounce(async () => {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

    const nextState = { ...address, alias: this.state.alias };

    if (nextState.threshold) {
      nextState.msigInfo = { ...nextState.msigInfo, threshold: this.state.threshold };
    }

    await this.props.onUpdateAddress(nextState);
  }, 600);

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
    const hasType = address.type > 0;

    let iconElement = null;
    if (hasType) {
      iconElement = WALLET_ADDRESS_TYPES_SVG[address.type];
    }

    if (address.type === 2) {
      return (
        <SceneAddressMultisig
          alias={this.state.alias}
          threshold={this.state.threshold}
          context={this.props.context}
          accounts={this.props.accounts}
          refreshing={this.props.refreshing}
          onRefresh={this._handleRefresh}
          onChange={this._handleAliasChange}
          onGetActorCode={this.props.onGetActorCode}
          onDeserializeParams={this.props.onDeserializedParams}
          onDeleteAddress={this.props.onDeleteAddress}
          onRemoveSigner={this.props.onRemoveSigner}
          onAddSigner={this.props.onAddSigner}
          icon={iconElement}
        />
      );
    }

    return (
      <div className="scene">
        <div className="body">
          <div className="body-inline-card">
            <QRCode value={"fil:" + address.address} />
          </div>

          <h1 className="body-heading" style={{ marginTop: 16 }}>
            {address.address}
          </h1>
          <p className="body-paragraph">Address</p>

          {hasType ? (
            <React.Fragment>
              <h2 className="body-heading" style={{ marginTop: 24 }}>
                {iconElement}&nbsp;{Constants.WALLET_ADDRESS_TYPES[address.type]}
              </h2>
              <p className="body-paragraph">Type</p>
            </React.Fragment>
          ) : null}

          {hasBalance ? (
            <React.Fragment>
              <h2 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.formatAsFilecoinConversion(address.balance)}
              </h2>
              <p className="body-paragraph">Balance</p>
            </React.Fragment>
          ) : null}

          {hasDate ? (
            <React.Fragment>
              <h2 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.toDate(address.timestamp)}
              </h2>
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

          {address.transactions && address.transactions.length ? (
            <h2 className="body-heading-two" style={{ marginTop: 48 }}>
              Transactions
            </h2>
          ) : null}
          <Transactions
            accounts={this.props.accounts}
            onGetMessage={this.props.onGetMessage}
            onGetActorCode={this.props.onGetActorCode}
            onDeserializeParams={this.props.onDeserializeParams}
            address={address}
          />

          <Input
            onChange={this._handleAliasChange}
            value={this.state.alias}
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
