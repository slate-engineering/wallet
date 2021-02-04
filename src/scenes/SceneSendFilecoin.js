import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import "~/src/scenes/Scene.css";

export default class SceneSendFilecoin extends React.Component {
  state = {
    fil: 0,
    source: "",
    destination: "",
  };

  _handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Send Filecoin</h1>
          <p className="body-paragraph">Send your Filecoin to the address of your choice.</p>

          <Input
            title="Source wallet address"
            description="The source of your Filecoin funds."
            name="source"
            style={{ marginTop: 48 }}
            value={this.state.source}
            onChange={this._handleChange}
          ></Input>

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
            <Button onClick={() => this.props.onSendFilecoin({ ...this.state })}>
              Create transaction
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
