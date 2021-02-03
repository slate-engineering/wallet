import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

export default class SceneAddress extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="scene">
          <div className="body">
            <h1 className="body-heading">{this.props.address}</h1>
            <p className="body-paragraph">Test</p>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
