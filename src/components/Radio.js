import "~/src/components/Radio.css";

import * as React from "react";

import FormSection from "~/src/components/FormSection";

export default class Radio extends React.Component {
  _handleChange = (data) => {
    this.props.onChange({
      target: data,
    });
  };

  render() {
    return (
      <div style={this.props.style}>
        <FormSection title={this.props.title} children={this.props.children} />
        <form>
          {this.props.options.map((radio) => {
            const checked = radio.selected === radio.value;

            return (
              <label className="radio" key={`radio-${radio.value}`}>
                <span className="radio-label">{radio.label}</span>
                <span className="radio-custom">
                  <span className="radio-custom-selected" style={{ opacity: checked ? 1 : 0 }} />
                </span>
                <input
                  className="radio-input"
                  type="radio"
                  name={radio.name}
                  value={radio.value}
                  checked={checked}
                  onChange={() => this._handleChange({ name: radio.name, value: radio.value })}
                />
              </label>
            );
          })}
        </form>
      </div>
    );
  }
}
