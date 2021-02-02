import * as React from "react";

import "~/src/components/Button.css";

const Button = (props) => {
  return <button {...props} className="button" onClick={props.onClick} children={props.children} />;
};

export default Button;
