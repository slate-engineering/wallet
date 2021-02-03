import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import "~/src/scenes/Scene.css";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

export default class SceneAddAddressPublic extends React.Component {
  state = {
    address: "",
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <React.Fragment>
        <div className="body">
          <h1 className="body-heading">Add Ledger Address</h1>
          <p className="body-paragraph">Figure out the flow Jeromy.</p>

          <div style={{ marginTop: 24 }}>
            <Button onClick={() => this.props.onNavigate("PORTFOLIO")}>Some Button</Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
