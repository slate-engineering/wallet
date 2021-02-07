import "~/src/scenes/Scene.css";
import "~/src/components/App.css";
import "~/src/components/Body.css";

import { FilecoinNumber } from "@glif/filecoin-number";
//import signing from "@zondax/filecoin-signing-tools";
import { ipcRenderer } from "electron";

import * as React from "react";
import * as Utilities from "~/src/common/utilities";
import * as SVG from "~/src/components/SVG.js";
import * as Constants from "~/src/common/constants";

import SceneAddAddress from "~/src/scenes/SceneAddAddress";
import SceneAddAddressLedger from "~/src/scenes/SceneAddAddressLedger";
import SceneAddAddressPublic from "~/src/scenes/SceneAddAddressPublic";
import SceneAddress from "~/src/scenes/SceneAddress";
import ScenePortfolio from "~/src/scenes/ScenePortfolio";
import SceneSendFilecoin from "~/src/scenes/SceneSendFilecoin";
import SceneSendFilecoinConfirm from "~/src/scenes/SceneSendFilecoinConfirm";
import SceneTransactions from "~/src/scenes/SceneTransactions";
import SceneContacts from "~/src/scenes/SceneContacts";

const WALLET_ADDRESS_TYPES_SVG = {
  1: <span style={{ width: 16, display: "inline-block", textAlign: "center" }}>❖</span>,
  2: <span style={{ width: 16, display: "inline-block", textAlign: "center" }}>⁂</span>,
  3: <span style={{ width: 16, display: "inline-block", textAlign: "center" }}>✢</span>,
};

const WALLET_SCENE = {
  PORTFOLIO: <ScenePortfolio />,
  ADD_ADDRESS: <SceneAddAddress />,
  ADD_ADDRESS_PUBLIC: <SceneAddAddressPublic />,
  ADD_ADDRESS_LEDGER: <SceneAddAddressLedger />,
  SEND: <SceneSendFilecoin />,
  SEND_CONFIRM: <SceneSendFilecoinConfirm />,
  TRANSACTIONS: <SceneTransactions />,
  ADDRESS: <SceneAddress />,
  CONTACTS: <SceneContacts />,
};

export default class App extends React.Component {
  state = {
    currentScene: "PORTFOLIO",
    accounts: { addresses: [] },
    context: null,
    theme: "LIGHT",
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

  update = async (currentScene) => {
    const accounts = await ipcRenderer.invoke("get-accounts");
    const settings = await ipcRenderer.invoke("get-settings");
    const config = await ipcRenderer.invoke("get-config");

    console.log({ accounts, settings, config });

    this.setState({
      accounts,
      settings,
      config,
      currentScene: currentScene ? currentScene : this.state.currentScene,
    });

    return { success: true };
  };

  _handleNavigate = (currentScene, newContext = {}) => {
    console.log("navigate", currentScene, newContext);
    if (currentScene === this.state.currentScene) {
      this.setState({ context: { ...newContext } });
      return { success: true };
    }

    this.setState({
      currentScene,
      context: { ...newContext },
    });

    return { success: true };
  };

  _handleUpdateAddress = async (data) => {
    const addresses = this.state.accounts.addresses.map((each) => {
      if (each.address === data.address) {
        return {
          ...each,
          ...data,
        };
      }

      return each;
    });

    const updateResponse = await ipcRenderer.invoke("write-accounts", { addresses });
    if (!updateResponse) {
      alert("write-account error");
      return { error: "write-account error" };
    }

    if (updateResponse.error) {
      alert(updateResponse.error);
      return { error: updateResponse.error };
    }

    const accounts = await ipcRenderer.invoke("get-accounts");
    if (accounts.error) {
      alert(accounts.error);
      return { error: accounts.error };
    }

    this.setState({ accounts });

    return { success: true };
  };

  _handleRefreshAddress = async ({ address }) => {
    const data = await ipcRenderer.invoke("get-balance", address);
    if (data.error) {
      alert(data.error);
      return { error: data.error };
    }

    if (!data.result) {
      alert("This address was not found on the network. Try again later.");
      return { error: "This address was not found on the network. Try again later." };
    }

    const transactions = await ipcRenderer.invoke("get-transactions", address);

    const addresses = this.state.accounts.addresses.map((each) => {
      if (address === each.address) {
        return {
          ...each,
          ...data.result,
          transactions,
        };
      }

      return each;
    });

    const updateResponse = await ipcRenderer.invoke("write-accounts", { addresses });
    if (updateResponse.error) {
      alert(updateResponse.error);
      return {
        error: updateResponse.error,
      };
    }

    console.log(updateResponse);

    return await this.update();
  };

  _handleAddPublicAddressWithExistingData = async (entry, nextNavigation) => {
    const transactions = await ipcRenderer.invoke("get-transactions", entry.address);

    const addresses = [
      { alias: entry.address, transactions: transactions, ...entry },
      ...this.state.accounts.addresses,
    ];

    console.log("writing account");
    const updateResponse = await ipcRenderer.invoke("write-accounts", { addresses });
    if (updateResponse.error) {
      alert(updateResponse.error);
      return {
        error: updateResponse.error,
      };
    }

    console.log(updateResponse);

    return await this.update(nextNavigation);
  };

  _handleAddPublicAddress = async (entry, nextNavigation) => {
    if (!entry.address) {
      alert("No address provided.");
      return { error: "No address provided." };
    }

    console.log("getting balance");
    const data = await ipcRenderer.invoke("get-balance", entry.address);
    if (data.error) {
      alert(data.error);
      return { error: data.error };
    }

    console.log(data);
    if (!data.result) {
      alert("This address was not found on the network. Try again later.");
      return { error: "This address was not found on the network. Try again later." };
    }

    return await this._handleAddPublicAddressWithExistingData(
      { ...entry, ...data.result },
      nextNavigation
    );
  };

  _handleSendFilecoin = async ({ source, destination, fil }) => {
    console.log({ source, destination, fil });

    const actor = await ipcRenderer.invoke("get-actor", source);
    if (actor.error) {
      alert(actor.error);
      return { error: actor.error };
    }

    console.log(actor);

    let num = new FilecoinNumber(fil, "FIL");
    let msg = {
      from: source,
      to: destination,
      value: num.toAttoFil(),
      nonce: actor.nonce,
    };

    console.log(msg);

    let estim = await ipcRenderer.invoke("estimate-gas", msg);
    console.log(estim);
    if (estim.error) {
      alert(estim.error);
      return { error: estim.error };
    }

    return this._handleNavigate("SEND_CONFIRM", { source, destination, fil, actor, estim, msg });
  };

  _handleConfirmSendFilecoin = async ({ source, destination, fil, actor, estim, msg }) => {
    const account = this.state.accounts.addresses.find((each) => each.address === source);
    account.actor = actor;

    let resp = await ipcRenderer.invoke(
      "sign-message",
      { kind: "ledger", path: account.path },
      estim
    );

    //console.log("serialized: ", signing.transactionSerialize(estim));
    if (resp.error) {
      alert(resp.error);
      return { error: resp.error };
    }

    console.log("Message CID: ", resp.result);

    if (!account.transactions) {
      account.transactions = [];
    }

    if (account.transactions) {
      account.transactions.push({ cid: resp.result["/"] });
    }

    const updateResponse = await this._handleUpdateAddress({ ...account });
    if (updateResponse.error) {
      alert(updateResponse.error);
      return {
        error: updateResponse.error,
      };
    }

    console.log(updateResponse);

    return this._handleNavigate("ADDRESS", { address: source });
  };

  _handleUpdateAccounts = async (newState) => {
    const response = await ipcRenderer.invoke("write-accounts", {
      ...this.state.accounts,
      ...newState,
    });

    console.log(response);

    if (response.error) {
      alert(response.error);
      return { error: response.error };
    }

    return await this.update();
  };

  _handleDeleteAddress = async ({ address }) => {
    const addresses = [...this.state.accounts.addresses].filter((each) => each.address !== address);
    const deleteResponse = await ipcRenderer.invoke("write-accounts", { addresses });
    if (deleteResponse.error) {
      alert(deleteResponse.error);
      return { error: deleteResponse.error };
    }

    console.log(deleteResponse);

    return await this.update("PORTFOLIO");
  };

  _handleGetMessage = async (mcid) => {
    const msg = await ipcRenderer.invoke("get-message", mcid);

    if (msg.error) {
      alert(msg.error);
      return { error: msg.error };
    }

    return msg;
  };

  _handleToggleTheme = () => {
    this.setState({ theme: this.state.theme !== "LIGHT" ? "LIGHT" : "DARK" });
  };

  render() {
    const nextScene = this.getScene(this.state.currentScene);

    // NOTE(jim):
    // Pass local props to the scene component.
    const sceneElement = React.cloneElement(nextScene, {
      onNavigate: this._handleNavigate,
      onRefreshAddress: this._handleRefreshAddress,
      onUpdateAddress: this._handleUpdateAddress,
      onUpdateAccounts: this._handleUpdateAccounts,
      onAddPublicAddress: this._handleAddPublicAddress,
      onAddPublicAddressWithExistingData: this._handleAddPublicAddressWithExistingData,
      onDeleteAddress: this._handleDeleteAddress,
      onSendFilecoin: this._handleSendFilecoin,
      onConfirmSendFilecoin: this._handleConfirmSendFilecoin,
      onGetMessage: this._handleGetMessage,
      onUpdate: this.update,
      accounts: this.state.accounts,
      config: this.state.config,
      settings: this.state.settings,
      context: this.state.context,
      currentScene: this.state.currentScene,
    });

    const rootClasses = Utilities.classNames(
      "root",
      this.state.theme === "LIGHT" ? "root-theme-light" : "root-theme-dark"
    );

    const portfolioClassNames = Utilities.classNames(
      "navigation-item",
      this.state.currentScene === "PORTFOLIO" ? "navigation-item--active" : null
    );
    const addClassNames = Utilities.classNames(
      "navigation-item",
      this.state.currentScene === "ADD_ADDRESS" ? "navigation-item--active" : null
    );
    const sendClassNames = Utilities.classNames(
      "navigation-item",
      this.state.currentScene === "SEND" ? "navigation-item--active" : null
    );
    const contactsClassNames = Utilities.classNames(
      "navigation-item",
      this.state.currentScene === "CONTACTS" ? "navigation-item--active" : null
    );
    const darkModeClassNames = Utilities.classNames(
      "navigation-item",
      this.state.theme === "DARK" ? "navigation-item--active" : null
    );

    return (
      <React.Fragment>
        <div className={rootClasses}>
          <div className="root-left">
            <div className="root-left-title">Addresses</div>
            {this.state.accounts.addresses.map((each) => {
              const iconElement = WALLET_ADDRESS_TYPES_SVG[each.type];

              return (
                <div
                  className="wallet-item"
                  key={each.address}
                  onClick={() => this._handleNavigate("ADDRESS", { address: each.address })}
                >
                  {iconElement ? <span className="wallet-item-left">{iconElement}</span> : null}{" "}
                  <div className="wallet-item-right">
                    <p className="wallet-item-right-top">
                      {Utilities.isEmpty(each.alias) ? "Untitled" : each.alias}
                    </p>
                    <p className="wallet-item-right-bottom">{each.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="root-right">
            <div className="root-top">
              <span
                className={portfolioClassNames}
                onClick={() => this._handleNavigate("PORTFOLIO")}
              >
                Portfolio
              </span>
              <span className={addClassNames} onClick={() => this._handleNavigate("ADD_ADDRESS")}>
                Add
              </span>
              <span className={sendClassNames} onClick={() => this._handleNavigate("SEND")}>
                Send
              </span>
              <span className={contactsClassNames} onClick={() => this._handleNavigate("CONTACTS")}>
                Contacts
              </span>
              <span
                className={darkModeClassNames}
                style={{ marginRight: 8 }}
                onClick={this._handleToggleTheme}
              >
                <SVG.Moon height="12px" />
              </span>
            </div>
            {sceneElement}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
