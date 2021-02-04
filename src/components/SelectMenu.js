import * as React from "react";
import * as SVG from "~/src/components/SVG";

import "~/src/components/SelectMenu.css";

export const SelectMenu = (props) => {
  let map = {};
  for (let option of props.options || []) {
    map[option.value] = option.name;
  }

  let presentationValue = map[props.value] ? map[props.value] : "Unselected";

  return (
    <div className="select-container" style={props.containerStyle}>
      <div className="select-menu-bounding-box">
        <label className="select-menu" htmlFor={`id-${props.name}`}>
          {presentationValue}{" "}
          {props.category ? <span className="select-menu-category">{props.category}</span> : null}
          <SVG.ChevronDown height="16px" className="select-menu-chevron" />
        </label>
        <select
          className="select-menu-anchor"
          value={props.value}
          onChange={props.onChange}
          name={props.name}
          id={`id-${props.name}`}
        >
          {(props.options || []).map((each) => {
            return (
              <option value={each.value} key={each.value}>
                {each.name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default SelectMenu;
