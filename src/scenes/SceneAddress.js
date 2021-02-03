import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

export default class SceneAddress extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="scene">
          <div className="body">
            <h1 className="body-heading">{this.props.address}</h1>
            <p className="body-paragraph">WIP</p>
            <h2 className="body-heading-two" style={{ marginTop: 88 }}>
              Delete this address
            </h2>
            <p className="body-paragraph">
              This will remove this address from your wallet. You can add it back later.
            </p>

            <div style={{ marginTop: 24 }}>
              <Button onClick={() => this.props.onDeleteAddress({ address: this.state.address })}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
