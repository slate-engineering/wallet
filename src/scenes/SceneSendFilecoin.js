import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import SelectMenu from "~/src/components/SelectMenu";
import Button from "~/src/components/Button";

import "~/src/scenes/Scene.css";

export default class SceneSendFilecoin extends React.Component {
  state = {
    fil: 0,
    source: undefined,
    signer: undefined,
    destination: "",
    loading: undefined,
    sourceAccount: null,
    multisigSpend: false,
    signers: [],
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  _handleChangeSource = (e) => {
    const account = this.props.accounts.addresses.find((a) => a.address == e.target.value);
    let signers = [];
    if (account.type === 2) {
      // if we are trying to spend from a multisig, grab the list of account
      // addresses we have locally that are signers of the source account to
      // populate the 'signer' dropdown with
      const msig_info = account.msig_info ?? {};
      const msig_signers = msig_info.signers ?? [];
      signers = this.props.accounts.addresses.filter((a) => msig_signers.includes(a.addressId));
    }
    this.setState({
      [e.target.name]: e.target.value,
      sourceAccount: account,
      multisigSpend: account.type === 2,
      signers: signers,
    });
  };

  _handleSendFilecoin = async (e) => {
    this.setState({ loading: 1 });

    if (Utilities.isEmpty(this.state.source)) {
      alert("You must specify a source address.");
      return this.setState({ loading: undefined });
    }

    if (Utilities.isEmpty(this.state.destination)) {
      alert("You must specify a destination.");
      return this.setState({ loading: undefined });
    }

    if (this.state.fil <= 0) {
      alert("You must provide a real amount of Filecoin to transfer.");
      return this.setState({ loading: undefined });
    }

    const response = await this.props.onSendFilecoin({
      fil: this.state.fil,
      source: this.state.source,
      sourceAccount: this.state.sourceAccount,
      signer: this.state.signer,
      destination: this.state.destination,
    });

    console.log(response);

    if (response.error) {
      this.setState({ loading: undefined });
      return { error: response.error };
    }
  };

  render() {
    console.log(this.state);

    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Send Filecoin</h1>
          <p className="body-paragraph">Send your Filecoin to the address of your choice.</p>

          <h2 className="body-heading-two" style={{ marginTop: 48 }}>
            Source wallet address
          </h2>
          <p className="body-paragraph" style={{ marginBottom: 12 }}>
            The source of your Filecoin funds.
          </p>

          <SelectMenu
            name="source"
            value={this.state.source}
            onChange={this._handleChangeSource}
            options={this.props.accounts.addresses.map((each) => {
              return {
                value: each.address,
                name: Utilities.isEmpty(each.alias) ? each.address : each.alias,
              };
            })}
          />

          {this.state.multisigSpend ? (
            this.state.signers.length > 0 ? (
              <React.Fragment>
                <h2 className="body-heading-two" style={{ marginTop: 48 }}>
                  Signer
                </h2>
                <p className="body-paragraph" style={{ marginBottom: 12 }}>
                  The address to use to sign this multisig transaction.
                </p>
                <SelectMenu
                  name="signer"
                  value={this.state.signer}
                  onChange={this._handleChange}
                  options={this.state.signers.map((each) => {
                    return {
                      value: each.address,
                      name: Utilities.isEmpty(each.alias) ? each.address : each.alias,
                    };
                  })}
                />
              </React.Fragment>
            ) : (
              <p> No accounts in this wallet can sign for this multisig! </p>
            )
          ) : null}

          <Input
            title="Destination wallet address"
            description="The destination address where you would like to receive your Filecoin."
            name="destination"
            style={{ marginTop: 48 }}
            value={this.state.destination}
            onChange={this._handleChange}
          ></Input>

          <p className="body-aside">
            Please ensure the Filecoin address you are providing is correct. If you provide an
            incorrect wallet address, this transaction submission could result in unrecoverable loss
            of some or all of your Filecoin tokens.
          </p>

          <Input
            title="Filecoin Amount"
            unit="FIL"
            type="number"
            name="fil"
            style={{ marginTop: 48 }}
            value={this.state.fil}
            onChange={this._handleChange}
          ></Input>

          <div style={{ marginTop: 24 }}>
            <Button onClick={this._handleSendFilecoin} loading={this.state.loading}>
              Prepare transaction
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
