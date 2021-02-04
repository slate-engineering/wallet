import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

import { ipcRenderer } from "electron";

import "~/src/scenes/Scene.css";

export default class ScenePortfolio extends React.Component {
  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Portfolio</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            All of your account information is shown here. (WIP)
          </p>
        </div>
      </div>
    );
  }
}
