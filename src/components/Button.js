import * as React from "react";

import "~/src/components/Button.css";

import LoaderSpinner from "~/src/components/LoaderSpinner";

const Button = (props) => {
  if (props.loading) {
    return (
      <button className="button button--loading">
        <LoaderSpinner height="14px" />
      </button>
    );
  }

  return <button {...props} className="button" onClick={props.onClick} children={props.children} />;
};

export default Button;
