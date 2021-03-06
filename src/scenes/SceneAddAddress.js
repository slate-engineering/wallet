import "~/src/scenes/Scene.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

export default class SceneAddAddress extends React.Component {
  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Add Filecoin Address</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            Pick from the options below.
          </p>

          <div className="body-card" onClick={() => this.props.onNavigate("ADD_ADDRESS_PUBLIC")}>
            <h2 className="body-heading-two">Add an existing public address</h2>
            <p className="body-paragraph">
              Use this option if you have a Filecoin address you want to track with this wallet.
            </p>
          </div>

          <div
            style={{ marginTop: 24 }}
            className="body-card"
            onClick={() => this.props.onNavigate("ADD_ADDRESS_LEDGER")}
          >
            <h2 className="body-heading-two">Connect your Ledger</h2>
            <p className="body-paragraph">
              Do you have a Ledger device? Use this option if you want to connect your Filecoin
              Ledger addresses.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
