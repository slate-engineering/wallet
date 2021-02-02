import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

export default class SceneAddAddress extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="scene">
          <div className="body">
            <Input
              title="Add Filecoin Wallet Address"
              description="X-ray powder diffraction, also known as xrd, is a rapid analytical technique primarily used for phase identification of a crystalline material and can provide information on unit cell dimensions."
            ></Input>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
