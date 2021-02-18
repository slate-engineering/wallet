import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import SelectMenu from "~/src/components/SelectMenu";
import Button from "~/src/components/Button";
import ParametersTable from "~/src/components/ParametersTable";

import "~/src/scenes/Scene.css";

export default class SceneMessage extends React.Component {
  _parameters = null;

  state = {
    fil: 0,
    source: undefined,
    signer: undefined,
    method: "",
    destination: "",
    loading: undefined,
    sourceAccount: null,
    multisigSpend: false,
    signers: [],
    suggestedDestinations: [],
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });

    if (e.target.name === "destination") {
      let suggestedDestinations = [];
      for (let c of this.props.accounts.contacts) {
        if (c.alias.includes(e.target.value)) {
          suggestedDestinations.push({ text: c.alias, value: c.address });
        }

        if (c.address.includes(e.target.value)) {
          suggestedDestinations.push({ text: c.address, value: c.address });
        }
      }

      this.setState({ suggestedDestinations });
    }
  };

  _handleSelectText = ({ value }) => {
    this.setState({ destination: value, suggestedDestinations: [] });
  };

  _handleChangeSource = (e) => {
    console.log(e.target.value);
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

  _handleSendMessage = async (e) => {
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
      alert("You must provide a real amount of Filecoin to transfer for this message.");
      return this.setState({ loading: undefined });
    }

    let parameters = {};
    if (this._parameters) {
      const list = this._parameters.getParameters();
      if (list.length) {
        for (let item of list) {
          parameters[item.param] = item.value;
        }
      }
    }

    const response = await this.props.onSendMessage({
      fil: this.state.fil,
      source: this.state.source,
      sourceAccount: this.state.sourceAccount,
      signer: this.state.signer,
      destination: this.state.destination,
      params: parameters,
      method: this.state.method,
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
          <h1 className="body-heading">Send Message</h1>
          <p className="body-paragraph">
            You can send any message you like with any method you like to any Filecoin Wallet
            address of choice.
          </p>

          <Input
            title="Method"
            description="This is the Actor method for this message."
            name="method"
            style={{ marginTop: 48 }}
            value={this.state.method}
            onChange={this._handleChange}
          ></Input>

          <h2 className="body-heading-two" style={{ marginTop: 48 }}>
            Params
          </h2>
          <p className="body-paragraph" style={{ marginBottom: 12 }}>
            You can add any number of parameters to this message.
          </p>

          <ParametersTable
            ref={(c) => {
              this._parameters = c;
            }}
          />

          <h2 className="body-heading-two" style={{ marginTop: 48 }}>
            Source wallet address
          </h2>
          <p className="body-paragraph" style={{ marginBottom: 12 }}>
            The source of your Filecoin funds for this message.
          </p>

          <SelectMenu
            name="source"
            value={this.state.source}
            onChange={this._handleChangeSource}
            options={this.props.accounts.addresses.map((each) => {
              return {
                value: each.address,
                name: Utilities.isEmpty(each.alias)
                  ? `${each.address} → ${Utilities.formatAsFilecoinConversion(each.balance)}`
                  : `${each.alias} → ${Utilities.formatAsFilecoinConversion(each.balance)}`,
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
                      name: Utilities.isEmpty(each.alias) ? `${each.address}` : `${each.alias}`,
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
            description="The destination address where you would like to receive message."
            name="destination"
            style={{ marginTop: 48 }}
            value={this.state.destination}
            onChange={this._handleChange}
            suggestions={this.state.suggestedDestinations}
            onSelectText={this._handleSelectText}
          ></Input>

          <p className="body-aside">
            Please ensure the Filecoin address you are providing is correct. If you provide an
            incorrect wallet address, this message submission could result in unrecoverable loss of
            some or all of your Filecoin tokens and message.
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
            <Button onClick={this._handleSendMessage} loading={this.state.loading}>
              Prepare message
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
