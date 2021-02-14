import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Input from "~/src/components/Input";

import "~/src/scenes/Scene.css";

export default class SceneSettings extends React.Component {
  render() {
    return (
      <div className="scene">
        <div className="body">Settings</div>
      </div>
    );
  }
}
