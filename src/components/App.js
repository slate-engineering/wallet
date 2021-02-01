import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import ScenePortfolio from "~/src/scenes/ScenePortfolio";
import SceneAddAddress from "~/src/scenes/SceneAddAddress";
import SceneSendFilecoin from "~/src/scenes/SceneSendFilecoin";
import SceneTransactions from "~/src/scenes/SceneTransactions";

import { ipcRenderer } from "electron";

import "~/src/scenes/Scene.css";
import "~/src/components/App.css";

const WALLET_ADDRESS_TYPES = {
  1: "BLS",
  2: "Multi Signature",
  3: "SECP-256K",
};

const WALLET_ADDRESS_TYPES_SVG = {
  1: <SVG.BLS height="12px" />,
  2: <SVG.MULTISIG height="12px" />,
  3: <SVG.SECP height="12px" />,
};

const WALLET_SCENE = {
  PORTFOLIO: <ScenePortfolio />,
  ADD: <SceneAddAddress />,
  SEND: <SceneSendFilecoin />,
  TRANSACTIONS: <SceneTransactions />,
};

export default class App extends React.Component {
  state = {
    addresses: [
      { address: "f011111", type: 1, alias: "Dog Scuttle" },
      { address: "f022222", type: 2, alias: "Cat Monkey" },
      { address: "f033333", type: 3, alias: "Ivory Turkey" },
    ],
    currentScene: "PORTFOLIO",
  };

  getScene = (scene) => {
    const next = WALLET_SCENE[scene];

    if (next) {
      return next;
    }

    return <div className="root-right">B</div>;
  };

  async componentDidMount() {
    const result = await ipcRenderer.invoke("get-state");

    if (!result) {
      console.warn("NO STATE");
      return;
    }

    this.setState(result);
  }

  _handleNavigate = (currentScene) => {
    this.setState({ currentScene });
  };

  render() {
    const nextScene = this.getScene(this.state.currentScene);

    return (
      <React.Fragment>
        <div className="root">
          <div className="root-top">
            <span className="navigation-item" onClick={() => this._handleNavigate("PORTFOLIO")}>
              Portfolio
            </span>
            <span className="navigation-item" onClick={() => this._handleNavigate("ADD")}>
              Add Address
            </span>
            <span className="navigation-item" onClick={() => this._handleNavigate("SEND")}>
              Send Filecoin
            </span>
            <span className="navigation-item" onClick={() => this._handleNavigate("TRANSACTIONS")}>
              Transactions
            </span>
          </div>
          <div className="root-bottom">
            <div className="root-left">
              {this.state.addresses.map((each) => {
                return (
                  <div className="wallet-item" key={each.address}>
                    <p>{each.address}</p>
                    <p>
                      {WALLET_ADDRESS_TYPES[each.type]} {WALLET_ADDRESS_TYPES_SVG[each.type]}
                    </p>
                    <p>{each.alias}</p>
                  </div>
                );
              })}
            </div>
            {nextScene}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
