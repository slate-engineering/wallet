import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import "~/src/scenes/Scene.css";

export default class SceneSendFilecoinConfirm extends React.Component {
  state = {
    loading: undefined,
  };

  _handleSendFilecoinConfirm = async () => {
    this.setState({ loading: 1 });
    const response = await this.props.onConfirmSendFilecoin({ ...this.props.context });
    this.setState({ loading: undefined });
  };

  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Confirm your Transaction</h1>
          <p className="body-paragraph">
            Confirm the transaction you want to make from your account.
          </p>

          <React.Fragment>
            <h2 className="body-heading-two" style={{ marginTop: 24 }}>
              {Utilities.formatAsFilecoinConversion(
                this.props.context.estim.gasLimit * this.props.context.estim.gasFeeCap
              )}
            </h2>
            <p className="body-paragraph">
              Gas limit maximum (gasLimit) ({this.props.context.estim.gasLimit}) x Maximum Filecoin
              charged per unit (gasFeeCap) ({this.props.context.estim.gasFeeCap}) = Estimated cost
              FIL/gas
            </p>
          </React.Fragment>

          <React.Fragment>
            <h2 className="body-heading-two" style={{ marginTop: 24 }}>
              {Utilities.formatAsFilecoinConversion(this.props.context.estim.gasPremium)}
            </h2>
            <p className="body-paragraph">
              Gas premium ({this.props.context.estim.gasPremium} attoFIL) x unknown gas cost =
              Included payment to miner.
            </p>
          </React.Fragment>

          <React.Fragment>
            <h2 className="body-heading-two" style={{ marginTop: 24 }}>
              {this.props.context.source}
            </h2>
            <p className="body-paragraph">Source address</p>
          </React.Fragment>

          <React.Fragment>
            <h2 className="body-heading-two" style={{ marginTop: 24 }}>
              {this.props.context.destination}
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
            <Button onClick={this._handleSendFilecoinConfirm} loading={this.state.loading}>
              Send Filecoin transaction
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
