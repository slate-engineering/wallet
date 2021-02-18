import "~/src/components/ParametersTable.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import { Converter, FilecoinNumber } from "@glif/filecoin-number";
import { ipcRenderer } from "electron";

import Button from "~/src/components/Button";

class ParametersTableRow extends React.Component {
  state = { id: this.props.id, param: this.props.param, value: this.props.value };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      console.log(this.state);
      return this._handleUpdateTable(this.state);
    });
  };

  _handleRemoveEntry = async ({ id }) => {
    return this.props.onRemoveEntry({ id });
  };

  _handleUpdateTable = (nextState) => {
    if (!nextState.id) {
      console.log("cant update ...");
      return null;
    }

    const params = this.props.params.map((each) => {
      if (each.id === nextState.id) {
        return { ...each, ...nextState };
      }

      return each;
    });

    return this.props.onUpdateTable({ params });
  };

  render() {
    return (
      <tr className="parameter-table-row">
        <td className="parameter-table-row-data">
          <textarea
            className="parameter-table-row-data-input"
            value={this.state.param}
            name="param"
            onChange={this._handleChange}
          ></textarea>
        </td>
        <td className="parameter-table-row-data">
          <textarea
            className="parameter-table-row-data-input"
            value={this.state.value}
            name="value"
            onChange={this._handleChange}
          ></textarea>
        </td>
        <td className="parameter-table-row-data parameter-table-row-data--action">
          <span
            className="parameter-table-button"
            onClick={() => this._handleRemoveEntry({ id: this.state.id })}
          >
            <SVG.Dismiss height="12px" />
          </span>
        </td>
      </tr>
    );
  }
}

export default class ParameterTable extends React.Component {
  _updateLock;

  getParameters = () => {
    return this.state.params;
  };

  state = {
    params: [],
  };

  _handleUpdateTable = ({ params }) => {
    this.setState({ params });
  };

  _handleAddEntry = async (newEntry) => {
    const params = [...this.state.params, newEntry];
    await this._handleUpdateTable({ params });
  };

  _handleRemoveEntry = async ({ id }) => {
    const params = this.state.params.filter((e) => e.id !== id);
    await this._handleUpdateTable({ params });
  };

  render() {
    const itemElements = this.state.params.map((each) => {
      return (
        <ParametersTableRow
          key={each.id}
          {...each}
          params={this.state.params}
          onUpdateTable={this._handleUpdateTable}
          onRemoveEntry={this._handleRemoveEntry}
        />
      );
    });

    return (
      <table className="parameter-table">
        <tbody>
          <tr className="parameter-table-row">
            <th className="parameter-table-row-heading">Parameter</th>
            <th className="parameter-table-row-heading">Value</th>
            <th className="parameter-table-row-heading parameter-table-row-heading--action">
              <Button
                onClick={() =>
                  this._handleAddEntry({
                    id: `parameter-table-${Date.now()}`,
                    param: "",
                    value: "",
                  })
                }
              >
                Add
              </Button>
            </th>
          </tr>
          {itemElements}
        </tbody>
      </table>
    );
  }
}
