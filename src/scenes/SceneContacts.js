import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import "~/src/scenes/Scene.css";

export default class SceneContacts extends React.Component {
  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Contacts</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            A list of all of your contacts. (WIP)
          </p>
        </div>
      </div>
    );
  }
}
