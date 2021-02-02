import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

import { ipcRenderer } from "electron";

export default class ScenePortfolio extends React.Component {
  state = {
    address: "f099",
    balance: "0"
  }

  async componentDidMount() {
    const resp = await ipcRenderer.invoke("get-balance", this.state.address);
    this.setState({ balance: resp.balance }) // NOTE: balance here is in attofil, needs to be divided by 10^18 for display
  }

  render() {
    return (
      <React.Fragment>
        <div className="scene">
          <div className="body">Portfolio</div>
          <div>{this.state.balance}</div>
        </div>
      </React.Fragment>
    );
  }
}
