import "~/src/components/Contacts.css";

import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import { Converter, FilecoinNumber } from "@glif/filecoin-number";
import { ipcRenderer } from "electron";

import Button from "~/src/components/Button";

class ContactsRow extends React.Component {
  state = { id: this.props.id, address: this.props.address, alias: this.props.alias };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      console.log(this.state);
      return this._handleUpdateTable(this.state);
    });
  };

  _handleRemoveEntry = async ({ id }) => {
    const confirm = window.confirm("Are you sure you want to delete this row?");

    if (!confirm) {
      return;
    }

    return await this.props.onRemoveEntry({ id });
  };

  _handleUpdateTable = (nextState) => {
    if (!nextState.id) {
      console.log("cant update ...");
      return null;
    }

    const contacts = this.props.contacts.map((each) => {
      if (each.id === nextState.id) {
        return { ...each, ...nextState };
      }

      return each;
    });

    return this.props.onUpdateTable({ contacts });
  };

  render() {
    return (
      <tr className="contacts-row">
        <td className="contacts-row-data">
          <textarea
            className="contacts-row-data-input"
            value={this.state.address}
            name="address"
            onChange={this._handleChange}
          ></textarea>
        </td>
        <td className="contacts-row-data">
          <textarea
            className="contacts-row-data-input"
            value={this.state.alias}
            name="alias"
            onChange={this._handleChange}
          ></textarea>
        </td>
        <td className="contacts-row-data contacts-row-data--action">
          <span
            className="contacts-button"
            onClick={() => this._handleRemoveEntry({ id: this.state.id })}
          >
            <SVG.Dismiss height="12px" />
          </span>
        </td>
      </tr>
    );
  }
}

export default class Contacts extends React.Component {
  _updateLock;

  state = {
    contacts: [],
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.accounts.contacts && this.props.accounts.contacts) {
      this.setState({ contacts: this.props.accounts.contacts });
    }
  }

  componentDidMount() {
    if (this.props.accounts.contacts) {
      this.setState({ contacts: this.props.accounts.contacts });
    }
  }

  _handleUpdateTable = ({ contacts }) => {
    console.log("table is updated", contacts);
    this.setState({ contacts }, () => {
      console.log("next phase");
      this._handleUpdateTableDebounced();
    });
  };

  _handleUpdateTableDebounced = Utilities.debounce(async () => {
    if (this._updateLock) {
      return null;
    }

    this._updateLock = true;
    console.log({ next: this.state });
    const response = await this.props.onUpdateAccounts(this.state);
    this._updateLock = false;
  }, 600);

  _handleAddEntry = async (newEntry) => {
    const contacts = [...this.state.contacts, newEntry];
    await this._handleUpdateTable({ contacts });
  };

  _handleRemoveEntry = async ({ id }) => {
    const contacts = this.state.contacts.filter((contact) => contact.id !== id);
    await this._handleUpdateTable({ contacts });
  };

  render() {
    const itemElements = this.state.contacts.map((each) => {
      return (
        <ContactsRow
          key={each.id}
          {...each}
          contacts={this.state.contacts}
          onUpdateTable={this._handleUpdateTable}
          onRemoveEntry={this._handleRemoveEntry}
        />
      );
    });

    return (
      <table className="contacts">
        <tbody>
          <tr className="contacts-row">
            <th className="contacts-row-heading">Address</th>
            <th className="contacts-row-heading">Alias</th>
            <th className="contacts-row-heading contacts-row-heading--action">
              <Button
                onClick={() =>
                  this._handleAddEntry({ id: `contact-${Date.now()}`, address: "", alias: "" })
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
