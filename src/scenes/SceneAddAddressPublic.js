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
      <div className="body">
        <h1 className="body-heading">Add address</h1>
        <p className="body-paragraph">Enter your public address here.</p>

        <Input
          onChange={this._handleChange}
          value={this.state.address}
          name="address"
          title="Public addresss"
          style={{ marginTop: 48 }}
        ></Input>

        <div style={{ marginTop: 24 }}>
          <Button
            onClick={() =>
              this.props.onAddPublicAddress({ address: this.state.address }, "PORTFOLIO")
            }
          >
            Add
          </Button>
        </div>
      </div>
    );
  }
}
