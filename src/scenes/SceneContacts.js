import "~/src/scenes/Scene.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import Contacts from "~/src/components/Contacts";

export default class SceneContacts extends React.Component {
  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Contacts</h1>
          <p className="body-paragraph" style={{ marginBottom: 48 }}>
            Add Filecoin addresses you frequently interact with.
          </p>

          <Contacts accounts={this.props.accounts} onUpdateAccounts={this.props.onUpdateAccounts} />
        </div>
      </div>
    );
  }
}
