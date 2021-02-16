import "~/src/scenes/Scene.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import { ipcRenderer } from "electron";

import Input from "~/src/components/Input";

export default class SceneSettings extends React.Component {
  state = {
    API_URL: this.props.config.API_URL,
    INDEX_URL: this.props.config.INDEX_URL,
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });

    this._handleChangeDebounced();
  };

  _handleChangeDebounced = Utilities.debounce(async () => {
    const config = await ipcRenderer.invoke("write-config", { ...this.state });

    console.log(config);

    await this.props.onUpdate();
  }, 1000);

  render() {
    console.log(this.props.config);

    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Settings</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            Update where the client receives and sends update to.
          </p>

          <Input
            onChange={this._handleChange}
            value={this.state.API_URL}
            name="API_URL"
            title="API URL"
            description="The default is: https://api.chain.love/rpc/v0"
            style={{ marginTop: 24 }}
          ></Input>

          <Input
            onChange={this._handleChange}
            value={this.state.INDEX_URL}
            name="INDEX_URL"
            title="Index URL"
            description="The default is: https://api.chain.love/wallet"
            style={{ marginTop: 24 }}
          ></Input>
        </div>
      </div>
    );
  }
}
