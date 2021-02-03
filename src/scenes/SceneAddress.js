import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import { ipcRenderer } from "electron";

export default class SceneAddress extends React.Component {
  update = async () => {
    const response = await ipcRenderer.invoke("get-balance", this.props.sceneData.address);

    console.log("received balance", response);

    const entity = { address: this.props.sceneData.address, ...response };

    console.log("new entity", entity);

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

    console.log("updated addresses", addresses);

    await ipcRenderer.invoke("write-accounts", { addresses });
    await this.props.onUpdate();

    console.log("should update");
    this.props.onNavigate("ADDRESS", entity);
  };

  async componentDidUpdate(prevProps) {
    if (this.props.sceneData.balance !== prevProps.sceneData.balance) {
      await this.update();
    }
  }

  async componentDidMount() {
    await this.update();
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
