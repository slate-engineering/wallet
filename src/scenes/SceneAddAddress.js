import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

export default class SceneAddAddress extends React.Component {
  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Add Filecoin address</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            Add an address to your Filecoin Wallet
          </p>

          <div className="body-card" onClick={() => this.props.onNavigate("ADD_ADDRESS_PUBLIC")}>
            <h2 className="body-heading-two">Add a public address</h2>
            <p className="body-paragraph">
              Add a public address on the Filecoin Network. If it is yours you will be able to send
              and receive Filecoin from the address.
            </p>
          </div>

          <div
            style={{ marginTop: 24 }}
            className="body-card"
            onClick={() => this.props.onNavigate("ADD_ADDRESS_LEDGER")}
          >
            <h2 className="body-heading-two">Add a Ledger address</h2>
            <p className="body-paragraph">
              If you have a ledger device you can add your address here.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
