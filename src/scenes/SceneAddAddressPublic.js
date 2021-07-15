import "~/src/scenes/Scene.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as Constants from "~/src/common/constants";

import { ipcRenderer } from "electron";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
import LoaderSpinner from "~/src/components/LoaderSpinner";

const SEARCH_DELAY = 1500;

const WALLET_ADDRESS_TYPES_SVG = {
  1: <span>❖</span>,
  2: <span>⁂</span>,
  3: <span>✢</span>,
};

export default class SceneAddAddressPublic extends React.Component {
  state = {
    address: "",
    loading: undefined,
  };

  _handleChangeDebounced = Utilities.debounce(async () => {
    if (Utilities.isEmpty(this.state.address)) {
      return;
    }

    this.setState({ checking: true });
    const data = await ipcRenderer.invoke("get-balance", this.state.address.trim());

    if (data.error) {
      alert(data.error);
      this.setState({ checking: false });
      return { error: data.error };
    }

    this.setState({ checking: false, data });
  }, SEARCH_DELAY);

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });

    this._handleChangeDebounced();
  };

  _handleAddPublicAddress = async ({ address }) => {
    this.setState({ loading: 1 });

    const response = await this.props.onAddPublicAddressWithExistingData(
      { address: this.state.address, ...this.state.data.result },
      "PORTFOLIO"
    );

    if (response.error) {
      this.setState({ loading: undefined });
    }
  };

  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Add address</h1>
          <p className="body-paragraph">Enter your public address here.</p>

          <Input
            onChange={this._handleChange}
            value={this.state.address}
            name="address"
            title="Public addresss"
            style={{ marginTop: 48 }}
          ></Input>

          {this.state.checking ? (
            <div className="body-status">
              <LoaderSpinner height="16px" style={{ marginRight: 16 }} /> Searching for your
              address...
            </div>
          ) : null}

          {this.state.data ? (
            <React.Fragment>
              <h2 className="body-heading" style={{ marginTop: 48 }}>
                {Utilities.formatAsFilecoinConversion(
                  this.state.data.result.balance,
                  this.props.price
                )}
              </h2>
              <p className="body-paragraph">Balance</p>

              <h2 className="body-heading" style={{ marginTop: 24 }}>
                {WALLET_ADDRESS_TYPES_SVG[this.state.data.result.type]}&nbsp;
                {Constants.WALLET_ADDRESS_TYPES[this.state.data.result.type]}
              </h2>
              <p className="body-paragraph">Type</p>

              <h2 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.toDate(this.state.data.result.timestamp)}
              </h2>
              <p className="body-paragraph">Last updated</p>
            </React.Fragment>
          ) : null}

          {this.state.data ? (
            <div style={{ marginTop: 24 }}>
              <Button loading={this.state.loading} onClick={this._handleAddPublicAddress}>
                Add address to wallet
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
