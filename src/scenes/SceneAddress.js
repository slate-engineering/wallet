import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as Constants from "~/src/common/constants";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
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

  _handleAddSigner = async () => {
    const response = await this.props.onAddSigner({ signer: this.state.signer });
    console.log(response);
    this.setState({ signer: "" });
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });

    return this._handleSaveDebounced();
  };

  _handleAliasChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });

    return this._handleSaveDebounced();
  };

  _handleSaveDebounced = Utilities.debounce(async () => {
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

    let signers = [];
    if (address.msigInfo && address.msigInfo.signers) {
      signers = address.msigInfo.signers;
    }

    let pending = [];
    if (address.msigInfo && address.msigInfo.pending) {
      pending = address.msigInfo.pending;
    }

    const hasDate = !Utilities.isEmpty(address.timestamp);
    const hasBalance = !Utilities.isEmpty(address.balance);
    const hasType = address.type > 0;
    const isMultiSig = address.type === 2;

    let iconElement = null;
    if (hasType) {
      iconElement = WALLET_ADDRESS_TYPES_SVG[address.type];
    }

    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">{address.address}</h1>
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
                {Utilities.formatAsFilecoinConversion(address.balance, this.props.price)}
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

          <Input
            onChange={this._handleAliasChange}
            value={this.state.alias}
            name="alias"
            title="Alias"
            description="Give your address an alias to make it easier to remember."
            style={{ marginTop: 48 }}
          ></Input>

          {isMultiSig ? (
            <Input
              onChange={this.props.onChange}
              value={this.props.threshold}
              name="threshold"
              title="Threshold"
              description="Determine how many signed attempts must pass before this transaction can be completed."
              style={{ marginTop: 48 }}
            ></Input>
          ) : null}

          {signers.length ? (
            <div className="scene-ms-box">
              {signers.map((each) => (
                <div key={each} className="scene-ms-box-item scene-ms-box-item--flex">
                  <div className="scene-ms-box-item-left">
                    {Utilities.getAlias(each, this.props.accounts, false)}
                  </div>
                  <div
                    className="scene-ms-box-item-right"
                    onClick={() => this.props.onRemoveSigner({ signer: each })}
                  >
                    remove
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {isMultiSig ? (
            <React.Fragment>
              <Input
                onChange={this._handleChange}
                value={this.state.signer}
                name="signer"
                title="Add signer"
                style={{ marginTop: 24 }}
              ></Input>

              <div style={{ marginTop: 16 }}>
                <Button loading={this.props.refreshing} onClick={this._handleAddSigner}>
                  Add
                </Button>
              </div>
            </React.Fragment>
          ) : null}

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
