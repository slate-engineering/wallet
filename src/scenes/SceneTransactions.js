import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

export default class SceneTransactions extends React.Component {
  render() {
    return (
      <div className="body">
        <h1 className="body-heading">Transactions</h1>
        <p className="body-paragraph" style={{ marginBottom: 48 }}>
          A list of all of your transactions.
        </p>
      </div>
    );
  }
}
