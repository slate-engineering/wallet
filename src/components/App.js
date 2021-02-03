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
import "~/src/components/Body.css";

const WALLET_ADDRESS_TYPES = {
  1: "BLS",
  2: "Multi Signature",
  3: "SECP-256K",
};

const WALLET_ADDRESS_TYPES_SVG = {
  1: <SVG.BLS height="20px" />,
  2: <SVG.MULTISIG height="20px" />,
  3: <SVG.SECP height="20px" />,
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
      { address: "f3rhtargx1gxz44", type: 1, alias: "Dog Scuttle" },
      { address: "f3sxs23xzcv123x", type: 2, alias: "Cat Monkey" },
      { address: "f0123zxcv34xsdg", type: 2, alias: "Cat Monkey 2" },
      { address: "f0arz5oxcvkl12d", type: 3, alias: "Ivory Turkey" },
    ],
    currentScene: "SEND",
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
    const settings = await ipcRenderer.invoke("get-settings");
    const config = await ipcRenderer.invoke("get-config");

    console.log({ settings, config });

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

    // NOTE(jim):
    // Pass local props to the scene component.
    const sceneElement = React.cloneElement(nextScene, { scene: true });

    return (
      <React.Fragment>
        <div className="root">
          <div className="root-left">
            <div className="root-left-title">Addresses</div>
            {this.state.addresses.map((each) => {
              return (
                <div className="wallet-item" key={each.address} onClick={() => {}}>
                  <span className="wallet-item-left">{WALLET_ADDRESS_TYPES_SVG[each.type]}</span>{" "}
                  <p className="wallet-item-right">{each.address}</p>
                </div>
              );
            })}
          </div>
          <div className="root-right">
            <div className="root-top">
              <span className="navigation-item" onClick={() => this._handleNavigate("PORTFOLIO")}>
                Portfolio
              </span>
              <span className="navigation-item" onClick={() => this._handleNavigate("ADD")}>
                Add
              </span>
              <span className="navigation-item" onClick={() => this._handleNavigate("SEND")}>
                Send
              </span>
              <span
                className="navigation-item"
                onClick={() => this._handleNavigate("TRANSACTIONS")}
              >
                Transactions
              </span>
            </div>
            {sceneElement}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
