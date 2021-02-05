import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";
import Button from "~/src/components/Button";

import "~/src/scenes/Scene.css";

export default class SceneAddAddressPublic extends React.Component {
  state = {
    address: "",
    loading: undefined,
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  _handleAddPublicAddress = async ({ address }) => {
    this.setState({ loading: 1 });
    await this.props.onAddPublicAddress({ address: this.state.address }, "PORTFOLIO");
  };

  render() {
    return (
      <div className="scene">
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
            <Button loading={this.state.loading} onClick={this._handleAddPublicAddress}>
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
