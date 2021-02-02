import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import "~/src/scenes/Scene.css";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

export default class SceneSendFilecoin extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="body">
          <h1 className="body-heading">Send Filecoin</h1>
          <p className="body-paragraph">Send your Filecoin to the address of your choice.</p>

          <Input
            title="Destination wallet address"
            description="The destination address where you would like to receive your Filecoin."
            style={{ marginTop: 48 }}
          ></Input>

          <p className="body-aside">
            Please ensure the Filecoin address you are providing is correct. If you provide an
            incorrect wallet address, this transaction submission could result in unrecoverable loss
            of some or all of your Filecoin tokens.
          </p>

          <Input title="Filecoin Amount" unit="FIL" style={{ marginTop: 48 }}></Input>

          <div style={{ marginTop: 24 }}>
            <Button>Send Filecoin</Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
