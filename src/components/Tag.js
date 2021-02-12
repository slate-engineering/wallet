import * as React from "react";

import "~/src/components/Tag.css";

export default class Tag extends React.Component {
  render() {
    return <span className="tag">{this.props.children}</span>;
  }
}
