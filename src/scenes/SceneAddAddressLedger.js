import "~/src/scenes/Scene.css";

import { ipcRenderer } from "electron";
import * as React from "react";
import * as Utilities from "~/src/common/utilities";
import Button from "~/src/components/Button";
import Input from "~/src/components/Input";
import * as SVG from "~/src/components/SVG.js";

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
      console.log("ERROR MESSAGE: ", ledgerResp.error);
      this.setState({
        curState: "error",
        errMsg: ledgerResp.error,
      });
      return;
    }

    const res = ledgerResp.result;
    console.log(res);

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
        return;
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
    function LedgerStatus(props) {
      const curState = props.curState;
      switch (curState) {
        case "start":
          return <p className="body-paragraph">Checking for ledger device...</p>;
        case "locked":
          return <p className="body-paragraph">Please unlock your device.</p>;
        case "error":
          return (
            <div>
              <p className="body-paragraph">Is your ledger plugged in and unlocked?</p>
              <p className="body-paragraph">ERROR: {props.errMsg}</p>
            </div>
          );

        case "addresses":
          let addrs = props.addresses ?? [];
          const items = addrs.map((a) => <li>{a.addrString}</li>);
          return <ul>{items}</ul>;
        default:
          return <p className="body-paragraph">The world is happy</p>;
      }
    }

    return (
      <div className="body">
        <h1 className="body-heading">Add Ledger Address</h1>
        <LedgerStatus
          curState={this.state.curState}
          errMsg={this.state.errMsg}
          addresses={this.state.addresses}
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
    );
  }
}
