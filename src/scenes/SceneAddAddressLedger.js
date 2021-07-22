import * as React from "react";
import * as Utilities from "~/src/common/utilities";
import * as SVG from "~/src/components/SVG.js";

import Button from "~/src/components/Button";
import Input from "~/src/components/Input";

import { ipcRenderer } from "electron";

import "~/src/scenes/Scene.css";

class LedgerStatus extends React.Component {
  state = {
    loadingMap: {},
  };

  _handleAddPublicAddress = async (fields) => {
    this.setState({ loadingMap: { ...this.state.loadingMap, [fields.address]: 1 } });

    const response = await this.props.onAddPublicAddress({
      address: fields.address,
      path: fields.path,
      compressedPK: fields.compressedPK,
    });

    this.setState({ loadingMap: { ...this.state.loadingMap, [fields.address]: undefined } });
  };

  render() {
    const { curState } = this.props;

    switch (curState) {
      case "start":
        return <p className="body-paragraph">Checking for ledger device...</p>;
      case "locked":
        return <p className="body-paragraph">Please unlock your device.</p>;
      case "error":
        return (
          <React.Fragment>
            <p className="body-paragraph">
              Is your ledger plugged in and unlocked? Is the Filecoin application open on your
              ledger?
            </p>
            <p className="body-paragraph">ERROR: {this.props.errMsg}</p>
          </React.Fragment>
        );

      case "addresses":
        let addrs = this.props.addresses ?? [];
        const items = addrs.map((a, index) => {
          const existing = this.props.existingAddresses.find(
            (each) => each.address === a.addrString
          );

          const loading = this.state.loadingMap[a.addrString];
          if (!Utilities.isEmpty(a.error_message) && !a.addrString) {
            return (
              <li className="body-address-item" key={`${a.path}`}>
                ({a.return_code}) {a.error_message}
              </li>
            );
          }

          return (
            <li className="body-address-item" key={a.addrString}>
              <span className="body-address-item-left">{a.addrString}</span>
              {existing ? null : (
                <span className="body-address-item-right">
                  <Button
                    loading={loading}
                    onClick={() =>
                      this._handleAddPublicAddress({
                        address: a.addrString,
                        path: a.path,
                        compressedPK: Buffer.from(a.compressed_pk).toString("hex"),
                        type: "ledger",
                      })
                    }
                  >
                    Add
                  </Button>
                </span>
              )}
            </li>
          );
        });
        return <ul className="body-address-list">{items}</ul>;
      default:
        return <p className="body-paragraph">The world is happy</p>;
    }
  }
}

export default class SceneAddAddressPublic extends React.Component {
  state = {
    addresses: [],
    curState: "start",
    errMsg: "",
  };

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  async componentDidMount() {
    this.checkForLedger();
  }

  async checkForLedger() {
    let ledgerResp = await ipcRenderer.invoke("get-ledger-version");
    if (ledgerResp.error) {
      this.setState({
        curState: "error",
        errMsg: ledgerResp.error,
      });
      return;
    }

    const res = ledgerResp.result;
    if (res.device_locked) {
      this.setState({
        curState: "locked",
      });
      return;
    }

    this.setState({
      curState: "addresses",
    });

    const pathBase = "m/44'/461'/0'/0/";

    let addresses = [];
    for (let i = 0; i < 10; i++) {
      let path = pathBase + i;
      let resp = await ipcRenderer.invoke("get-ledger-address", path);
      if (resp.error) {
        this.setState({
          curState: "error",
          errMsg: resp.error,
        });
        continue;
      }

      let addrInfo = resp.result;
      addrInfo.path = path;
      addresses.push(addrInfo);

      this.setState({
        addresses: addresses,
      });
    }
  }

  render() {
    return (
      <div className="scene">
        <div className="body">
          <h1 className="body-heading">Add Ledger Address</h1>
          <LedgerStatus
            curState={this.state.curState}
            errMsg={this.state.errMsg}
            addresses={this.state.addresses}
            existingAddresses={this.props.accounts.addresses}
            onAddPublicAddress={this.props.onAddPublicAddress}
          />
          <div
            style={{
              marginTop: 24,
            }}
          >
            <Button
              onClick={() => {
                this.setState({ curState: "start" });
                this.checkForLedger();
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
