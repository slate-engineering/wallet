import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";

import ScenePortfolio from "~/src/scenes/ScenePortfolio";
import SceneAddAddress from "~/src/scenes/SceneAddAddress";
import SceneSendFilecoin from "~/src/scenes/SceneSendFilecoin";
import SceneTransactions from "~/src/scenes/SceneTransactions";
import SceneAddress from "~/src/scenes/SceneAddress";
import SceneAddAddressPublic from "~/src/scenes/SceneAddAddressPublic";
import SceneAddAddressLedger from "~/src/scenes/SceneAddAddressLedger";

import { ipcRenderer } from "electron";

import "~/src/scenes/Scene.css";
import "~/src/components/App.css";
import "~/src/components/Body.css";

const WALLET_ADDRESS_TYPES = {
  1: "BLS",
  2: "Multi Signature",
  3: "SECP-256K1",
};

const WALLET_ADDRESS_TYPES_SVG = {
  1: <SVG.BLS height="20px" />,
  2: <SVG.MULTISIG height="20px" />,
  3: <SVG.SECP height="20px" />,
};

const WALLET_SCENE = {
  PORTFOLIO: <ScenePortfolio />,
  ADD_ADDRESS: <SceneAddAddress />,
  ADD_ADDRESS_PUBLIC: <SceneAddAddressPublic />,
  ADD_ADDRESS_LEDGER: <SceneAddAddressLedger />,
  SEND: <SceneSendFilecoin />,
  TRANSACTIONS: <SceneTransactions />,
  ADDRESS: <SceneAddress />,
};

export default class App extends React.Component {
  state = {
    accounts: [],
    currentScene: "ADD_ADDRESS",
    sceneData: null,
  };

  getScene = (scene) => {
    const next = WALLET_SCENE[scene];

    if (next) {
      return next;
    }

    return <div className="root-right"></div>;
  };

  async componentDidMount() {
    await this.update();
  }

  update = async () => {
    const accounts = await ipcRenderer.invoke("get-accounts");
    const settings = await ipcRenderer.invoke("get-settings");
    const config = await ipcRenderer.invoke("get-config");

    this.setState({ accounts: accounts.addresses, settings, config });
  };

  _handleNavigate = (currentScene, sceneData = {}) => {
    this.setState({ currentScene, sceneData: { ...sceneData, updated: new Date().getTime() } });
  };

  _handleAddPublicAddress = async ({ address }) => {
    // TODO(jim)
    // Add address to accounts
    const addresses = [{ address }, ...this.state.accounts];
    await ipcRenderer.invoke("write-accounts", { addresses });

    await this.update();

    this._handleNavigate("PORTFOLIO");
  };

  _handleDeleteAddress = async ({ address }) => {
    // TODO(jim)
    // Add address to accounts
    const addresses = [...this.state.accounts].filter((each) => each.address !== address);
    await ipcRenderer.invoke("write-accounts", { addresses });

    await this.update();

    this._handleNavigate("PORTFOLIO");
  };

  render() {
    const nextScene = this.getScene(this.state.currentScene);

    // NOTE(jim):
    // Pass local props to the scene component.
    const sceneElement = React.cloneElement(nextScene, {
      onNavigate: this._handleNavigate,
      onAddPublicAddress: this._handleAddPublicAddress,
      onDeleteAddress: this._handleDeleteAddress,
      onUpdate: this.update,
      scene: true,
      ...this.state,
    });

    return (
      <React.Fragment>
        <div className="root">
          <div className="root-left">
            <div className="root-left-title">Addresses</div>
            {this.state.accounts.map((each) => {
              const icon = WALLET_ADDRESS_TYPES_SVG[each.type];
              return (
                <div
                  className="wallet-item"
                  key={each.address}
                  onClick={() => this._handleNavigate("ADDRESS", { ...each })}
                >
                  {icon ? <span className="wallet-item-left">{icon}</span> : null}{" "}
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
              <span className="navigation-item" onClick={() => this._handleNavigate("ADD_ADDRESS")}>
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
