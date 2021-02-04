import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import { ipcRenderer } from "electron";

export default class SceneAddress extends React.Component {
  render() {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

    if (!address) {
      return (
        <div className="scene">
          <div className="body">
            <h1 className="body-heading">Address not found.</h1>
            <p className="body-paragraph">Please try a different wallet address.</p>
          </div>
        </div>
      );
    }

    const hasDate = !Utilities.isEmpty(address.timestamp);
    const hasBalance = !Utilities.isEmpty(address.balance);

    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">{address.address}</h1>
          <p className="body-paragraph">Filecoin Public Address</p>

          {hasBalance ? (
            <React.Fragment>
              <h1 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.formatAsFilecoinConversion(address.balance)}
              </h1>
              <p className="body-paragraph">Filecoin Balance (FIL)</p>
            </React.Fragment>
          ) : null}

          {hasDate ? (
            <React.Fragment>
              <h1 className="body-heading" style={{ marginTop: 24 }}>
                {Utilities.toDate(address.timestamp)}
              </h1>
              <p className="body-paragraph">Last Updated</p>
            </React.Fragment>
          ) : null}

          <h2 className="body-heading-two" style={{ marginTop: 88 }}>
            Refresh
          </h2>
          <p className="body-paragraph">
            To get a balance update hit the refresh button below. Sorry there is not a better way to
            do this.
          </p>

          <div style={{ marginTop: 24 }}>
            <Button onClick={() => this.props.onRefreshAddress({ address: address.address })}>
              Refresh balance
            </Button>
          </div>

          <h2 className="body-heading-two" style={{ marginTop: 48 }}>
            Delete this address
          </h2>
          <p className="body-paragraph">
            This will remove this address from your wallet. You can add it back later.
          </p>

          <div style={{ marginTop: 24 }}>
            <Button onClick={() => this.props.onDeleteAddress({ address: address.address })}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
