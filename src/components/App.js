import "~/src/scenes/Scene.css";
import "~/src/components/App.css";
import "~/src/components/Body.css";

import * as React from "react";
import * as Utilities from "~/src/common/utilities";
import * as SVG from "~/src/components/SVG.js";
import * as Constants from "~/src/common/constants";

import { FilecoinNumber } from "@glif/filecoin-number";
import { ipcRenderer } from "electron";

import SceneAddAddress from "~/src/scenes/SceneAddAddress";
import SceneAddAddressLedger from "~/src/scenes/SceneAddAddressLedger";
import SceneAddAddressPublic from "~/src/scenes/SceneAddAddressPublic";
import SceneAddress from "~/src/scenes/SceneAddress";
import ScenePortfolio from "~/src/scenes/ScenePortfolio";
import SceneSendFilecoin from "~/src/scenes/SceneSendFilecoin";
import SceneSendMessageConfirm from "~/src/scenes/SceneSendMessageConfirm";
import SceneContacts from "~/src/scenes/SceneContacts";
import SceneSettings from "~/src/scenes/SceneSettings";

const addressStyle = { width: 16, display: "inline-block", textAlign: "center" };

const WALLET_ADDRESS_TYPES_SVG = {
  1: <span style={addressStyle}>◈</span>,
  2: <span style={addressStyle}>⁂</span>,
  3: <span style={addressStyle}>✢</span>,
};

const WALLET_SCENE = {
  PORTFOLIO: <ScenePortfolio />,
  ADD_ADDRESS: <SceneAddAddress />,
  ADD_ADDRESS_PUBLIC: <SceneAddAddressPublic />,
  ADD_ADDRESS_LEDGER: <SceneAddAddressLedger />,
  SEND: <SceneSendFilecoin />,
  SEND_CONFIRM: <SceneSendMessageConfirm />,
  ADDRESS: <SceneAddress />,
  CONTACTS: <SceneContacts />,
  SETTINGS: <SceneSettings />,
};

export default class App extends React.Component {
  state = {
    currentScene: "PORTFOLIO",
    accounts: { addresses: [] },
    context: null,
    config: {},
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
    // NOTE(jim):
    // A safe key to use for premium data. (Public key, not secret)
    // Probably will run our rate up but I don't care.

    /* NOTICE FROM IEX CLOUD
    // https://iexcloud.io/docs/api/#authentication
    Publishable API tokens are meant solely to identify your account with IEX Cloud, they aren’t secret. 
    They can be published in places like your website JavaScript code, or in an iPhone or Android app.
    */
    const response = await fetch(
      "https://cloud.iexapis.com/stable/crypto/filusdt/price?token=pk_aa330a89a4724944ae1a525879a19f2d"
    );
    const data = await response.json();

    console.log({ accounts, settings, config, data });

    // NOTE(jim): Ask Why to stop capitalizing the first letter of variables.
    this.setState({
      accounts,
      settings,
      config,
      currentScene: currentScene ? currentScene : this.state.currentScene,
      price: data.Price,
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

    // Get both the ID address and the robust address variants for this account
    const resolveResp = await ipcRenderer.invoke("resolve-address", address);
    if (resolveResp.error) {
      alert(resolveResp.error);
      return { error: resolveResp.error };
    }

    const addrs = resolveResp.result;

    // normalize to using the robust address for the 'primary' key
    address = addrs.address;

    let transactions = await ipcRenderer.invoke("get-transactions-as-array", address);

    // If we are refreshing a multisig, also check the multisig state
    let msigInfo;
    if (data.result.type == 2) {
      console.log("refreshing multisig!");
      const resp = await ipcRenderer.invoke("get-multisig-info", address);
      if (resp.error) {
        alert("failed to fetch multisig info for account: " + resp.error);
        return { error: resp.error };
      }
      msigInfo = resp.result;
    }

    const addresses = this.state.accounts.addresses.map((each) => {
      if (address === each.address) {
        return {
          ...each,
          ...data.result,
          transactions,
          addressId: addrs.addressId,
          msigInfo,
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
    for (let a of this.state.accounts.addresses) {
      if (entry.address === a.address) {
        alert("This address already exists in your wallet.");
        return { error: "This address already exists in your wallet." };
      }
    }

    const transactions = await ipcRenderer.invoke("get-transactions-as-array", entry.address);

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

  _handleSendMessage = async ({
    source,
    sourceAccount,
    signer,
    destination,
    fil,
    params,
    method,
  }) => {
    console.log({ source, destination, fil, params, method });
    let message = null;
    let filecoin = new FilecoinNumber(fil, "FIL");
    let type = signer ? "MULTISIG" : "REGULAR";

    // NOTE(jim): Regular transactions
    if (type === "REGULAR") {
      let encodedParams = null;
      if (params) {
        const response = await ipcRenderer.invoke("serialize-params", params);
        if (response.error) {
          alert(response.error);
          return { error: response.error };
        }
        encodedParams = response.result;
      }

      const actor = await ipcRenderer.invoke("get-actor", source);
      if (actor.error) {
        alert(actor.error);
        return { error: actor.error };
      }

      message = {
        from: source,
        to: destination,
        value: filecoin.toAttoFil(),
        nonce: actor.nonce,
        method: method,
        params: encodedParams,
      };
    }

    // NOTE(jim): This will create a multisig message.
    if (type === "MULTISIG") {
      let mutliResponse = await ipcRenderer.invoke(
        "signing-propose-multisig",
        source,
        destination,
        signer,
        num.toAttoFil()
      );

      if (multiResponse.error) {
        alert(multiResponse.error);
        return { error: multiResponse.error };
      }

      message = multiResponse.result;
    }

    console.log("message: ", { message });
    let estimation = await ipcRenderer.invoke("estimate-gas", message);
    console.log("estimation: ", { estimation });
    if (estimation.error) {
      alert(estimination.error);
      return { error: estimination.error };
    }

    return this._handleNavigate("SEND_CONFIRM", {
      source,
      destination,
      fil,
      estim: estimation,
      msg: message,
    });
  };

  _handleConfirmSendMessage = async ({
    source,
    destination,
    fil,
    actor,
    estim,
    msg,
    params,
    method,
  }) => {
    const account = this.state.accounts.addresses.find((each) => each.address === msg.from);
    account.actor = actor;

    let resp = await ipcRenderer.invoke("sign-message", account, estim);

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

  _handleGetActorCode = async (address) => {
    const code = await ipcRenderer.invoke("get-actor-code", address);

    if (code.error) {
      alert(code.error);
      return { error: code.error };
    }

    return code;
  };

  _handleDeserializeParams = async (parameters, code, method) => {
    const p = await ipcRenderer.invoke("deserialize-params", parameters, code["/"], method);

    if (p.error) {
      console.error(p.error);
      return { error: p.error };
    }

    return p;
  };

  _handleAddSigner = ({ signer }) => {
    console.log(signer);
  };

  _handleRemoveSigner = ({ signer }) => {
    console.log(signer);
  };

  _handleToggleTheme = async () => {
    const config = await ipcRenderer.invoke("write-config", {
      ...this.state.config,
      theme: this.state.config.theme !== "LIGHT" ? "LIGHT" : "DARK",
    });

    await this.update();
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
      onSendFilecoin: this._handleSendMessage,
      onSendMessage: this._handleSendMessage,
      onConfirmSendMessage: this._handleConfirmSendMessage,
      onGetMessage: this._handleGetMessage,
      onGetActorCode: this._handleGetActorCode,
      onDeserializeParams: this._handleDeserializeParams,
      onUpdate: this.update,
      onRemoveSigner: this._handleRemoveSigner,
      onAddSigner: this._handleAddSigner,
      accounts: this.state.accounts,
      config: this.state.config,
      settings: this.state.settings,
      context: this.state.context,
      currentScene: this.state.currentScene,
      price: this.state.price,
    });

    const rootClasses = Utilities.classNames(
      "root",
      this.state.config.theme === "LIGHT" ? "root-theme-light" : "root-theme-dark"
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
    const settingsClassNames = Utilities.classNames(
      "navigation-item",
      this.state.currentScene === "SETTINGS" ? "navigation-item--active" : null
    );
    const darkModeClassNames = Utilities.classNames(
      "navigation-item",
      this.state.config && this.state.config.theme === "DARK" ? "navigation-item--active" : null
    );

    return (
      <React.Fragment>
        <div className={rootClasses}>
          <div className="root-left">
            <div className="root-left-container">
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
              <span className={settingsClassNames} onClick={() => this._handleNavigate("SETTINGS")}>
                Settings
              </span>
              <span
                className={darkModeClassNames}
                style={{ marginRight: 8 }}
                onClick={this._handleToggleTheme}
              >
                ◑
              </span>
            </div>
            {sceneElement}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
