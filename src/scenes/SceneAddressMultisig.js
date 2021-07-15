import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as Constants from "~/src/common/constants";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
import Tag from "~/src/components/Tag";

import { ipcRenderer } from "electron";

export default class SceneAddressMultisig extends React.Component {
  state = {
    signer: "",
  };

  _handleAddSigner = async () => {
    const response = await this.props.onAddSigner({ signer: this.state.signer });
    this.setState({ signer: "" });
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

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

    return (
      <div className="scene">
        <div className="body">
          <div className="scene-ms-layout">
            <div className="scene-ms-layout-left">
              <div className="scene-ms-title">Signers</div>

              {signers.length && (
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
              )}

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
            </div>

            <div className="scene-ms-layout-right">
              <div className="scene-ms-title" style={{ marginTop: 4 }}>
                Account Information
              </div>

              <h1 className="body-heading" style={{ marginTop: 54 }}>
                {address.address}
              </h1>
              <p className="body-paragraph">Address</p>

              {hasType ? (
                <React.Fragment>
                  <h2 className="body-heading" style={{ marginTop: 24 }}>
                    {this.props.icon}&nbsp;{Constants.WALLET_ADDRESS_TYPES[address.type]}
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
                  loading={this.props.refreshing}
                  onClick={() => this.props.onRefresh({ address: address.address })}
                >
                  Refresh
                </Button>
              </div>

              <Input
                onChange={this.props.onChange}
                value={this.props.threshold}
                name="threshold"
                title="Threshold"
                description="Determine how many signed attempts must pass before this transaction can be completed."
                style={{ marginTop: 48 }}
              ></Input>

              <Input
                onChange={this.props.onChange}
                value={this.props.alias}
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
        </div>
      </div>
    );
  }
}
