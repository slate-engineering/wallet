import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import { ipcRenderer } from "electron";

export default class SceneAddress extends React.Component {
  async componentDidMount() {
    const response = await ipcRenderer.invoke("get-balance", this.props.sceneData.address);

    console.log(response);

    const entity = { address: this.props.sceneData.address, ...response };

    console.log(entity);

    if (!entity.balance) {
      console.warn("We did not perform an update.");
      return null;
    }

    const addresses = this.props.accounts.map((a) => {
      if (a.address === this.props.sceneData.address) {
        return entity;
      }

      return a;
    });

    await ipcRenderer.invoke("write-accounts", { addresses });
    console.log(response);

    await this.props.onUpdate();
  }

  render() {
    const hasDate = !Utilities.isEmpty(this.props.sceneData.timestamp);
    const hasBalance = !Utilities.isEmpty(this.props.sceneData.balance);

    console.log(this.props);
    return (
      <React.Fragment>
        <div className="scene">
          <div className="body">
            <h1 className="body-heading">{this.props.sceneData.address}</h1>
            <p className="body-paragraph">Filecoin Public Address</p>

            {hasBalance ? (
              <React.Fragment>
                <h1 className="body-heading" style={{ marginTop: 24 }}>
                  {Utilities.formatAsFilecoinConversion(this.props.sceneData.balance)}
                </h1>
                <p className="body-paragraph">Filecoin Balance (FIL)</p>
              </React.Fragment>
            ) : null}

            {hasDate ? (
              <React.Fragment>
                <h1 className="body-heading" style={{ marginTop: 24 }}>
                  {Utilities.toDate(this.props.sceneData.timestamp)}
                </h1>
                <p className="body-paragraph">Last Updated</p>
              </React.Fragment>
            ) : null}

            <h2 className="body-heading-two" style={{ marginTop: 88 }}>
              Delete this address
            </h2>
            <p className="body-paragraph">
              This will remove this address from your wallet. You can add it back later.
            </p>

            <div style={{ marginTop: 24 }}>
              <Button
                onClick={() =>
                  this.props.onDeleteAddress({ address: this.props.sceneData.address })
                }
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
