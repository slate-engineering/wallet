import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import "~/src/scenes/Scene.css";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

export default class SceneSendFilecoinConfirm extends React.Component {
  render() {
    return (
      <div className="body">
        <h1 className="body-heading">Confirm your Transaction</h1>
        <p className="body-paragraph">
          Confirm the transaction you want to make from your account.
        </p>

        <React.Fragment>
          <h2 className="body-heading-two" style={{ marginTop: 24 }}>
            {this.props.context.source}
          </h2>
          <p className="body-paragraph">Source address</p>
        </React.Fragment>

        <React.Fragment>
          <h2 className="body-heading-two" style={{ marginTop: 24 }}>
            {this.props.context.source}
          </h2>
          <p className="body-paragraph">Destination address</p>
        </React.Fragment>

        <React.Fragment>
          <h2 className="body-heading-two" style={{ marginTop: 24 }}>
            {this.props.context.fil}
          </h2>
          <p className="body-paragraph">Amount</p>
        </React.Fragment>

        <div style={{ marginTop: 24 }}>
          <Button onClick={() => this.props.onConfirmSendFilecoin({ ...this.props.context })}>
            Send Filecoin transaction
          </Button>
        </div>
      </div>
    );
  }
}
