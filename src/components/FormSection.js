import "~/src/components/FormSection.css";

import * as React from "react";
import * as Utilities from "~/src/common/utilities";

export default class FormSection extends React.Component {
  render() {
    return (
      <div className="form-section">
        {!Utilities.isEmpty(this.props.title) ? (
          <div className="form-section-title">{this.props.title}</div>
        ) : null}

        {!Utilities.isEmpty(this.props.children) ? (
          <div className="form-section-body">{this.props.children}</div>
        ) : null}
      </div>
    );
  }
}
