import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import "~/src/scenes/Scene.css";

export default class SceneSendMessageConfirm extends React.Component {
  state = {
    loading: undefined,
  };

  _handleSendMessageConfirm = async () => {
    this.setState({ loading: 1 });
    const response = await this.props.onConfirmSendMessage({ ...this.props.context });
    this.setState({ loading: undefined });
  };

  render() {
    console.log(this.props.context);
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Confirm your Transaction</h1>
          <p className="body-paragraph">
            Confirm the message you are sending to the Filecoin Network from your address{" "}
            {this.props.context.source}.
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

          {this.props.context.params ? (
            <React.Fragment>
              <h2 className="body-heading-two" style={{ marginTop: 24 }}>
                {JSON.stringify(this.props.context.params)}
              </h2>
              <p className="body-paragraph">Parameters</p>
            </React.Fragment>
          ) : null}

          {this.props.context.method ? (
            <React.Fragment>
              <h2 className="body-heading-two" style={{ marginTop: 24 }}>
                {this.props.context.method}
              </h2>
              <p className="body-paragraph">Method</p>
            </React.Fragment>
          ) : null}

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
            <h2 className="body-heading-two" style={{ marginTop: 48, fontSize: 32 }}>
              {Utilities.formatAsFilecoin(this.props.context.fil, this.props.price)}
            </h2>
            <p className="body-paragraph">Total amount</p>
          </React.Fragment>

          <div style={{ marginTop: 24 }}>
            <Button onClick={this._handleSendMessageConfirm} loading={this.state.loading}>
              Finalize and send
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
