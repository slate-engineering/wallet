import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import "~/src/components/Input.css";

export default class Input extends React.Component {
  _unit;
  _input;

  componentDidMount = () => {
    if (this.props.unit) {
      this._input.style.paddingRight = `${this._unit.offsetWidth + 48}px`;
    }

    if (this.props.autoFocus) {
      this._input.focus();
    }
  };

  _handleCopy = (e) => {
    this._input.select();
    document.execCommand("copy");
  };

  _handleKeyUp = (e) => {
    if (this.props.onKeyUp) {
      this.props.onKeyUp(e);
    }

    if ((e.which === 13 || e.keyCode === 13) && this.props.onSubmit) {
      this.props.onSubmit(e);
      return;
    }
  };

  _handleChange = (e) => {
    if (!Utilities.isEmpty(this.props.pattern) && !Utilities.isEmpty(e.target.value)) {
      const TestRegex = new RegExp(this.props.pattern);
      if (!TestRegex.test(e.target.value)) {
        e.preventDefault();
        return;
      }
    }

    if (e.target.value && e.target.value.length > this.props.max) {
      e.preventDefault();
      return;
    }

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  };

  render() {
    return (
      <div className="input-container" style={this.props.style}>
        <div style={{ maxWidth: "480px" }}>
          {!Utilities.isEmpty(this.props.title) ? (
            <div className="description-label">{this.props.title}</div>
          ) : null}

          {!Utilities.isEmpty(this.props.description) ? (
            <div className="description-body">{this.props.description}</div>
          ) : null}
        </div>
        <div style={{ position: "relative" }}>
          <input
            className="input"
            ref={(c) => {
              this._input = c;
            }}
            autoComplete="off"
            autoFocus={this.props.autoFocus}
            value={this.props.value}
            name={this.props.name}
            type={this.props.type}
            placeholder={this.props.placeholder}
            onChange={this._handleChange}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
            onKeyUp={this._handleKeyUp}
            disabled={this.props.disabled}
            readOnly={this.props.readOnly}
            style={{
              paddingRight: this.props.copyable ? "32px" : "24px",
              ...this.props.inputStyle,
            }}
          />
          <div
            className="input-unit"
            ref={(c) => {
              this._unit = c;
            }}
          >
            {this.props.unit}
          </div>
        </div>
      </div>
    );
  }
}
