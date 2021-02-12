import * as React from "react";
import * as SVG from "~/src/components/SVG.js";
import * as Utilities from "~/src/common/utilities";
import * as Constants from "~/src/common/constants";

import QRCode from "qrcode.react";
import Input from "~/src/components/Input";
import Button from "~/src/components/Button";
import Transactions from "~/src/components/Transactions";
import Tag from "~/src/components/Tag";

import { ipcRenderer } from "electron";

export default class SceneAddressMultisig extends React.Component {
  render() {
    const address = this.props.accounts.addresses.find(
      (account) => account.address === this.props.context.address
    );

    let signers = [];
    if (address.msigInfo && address.msigInfo.signers) {
      signers = address.msigInfo.signers;
    }

    let pending = [];
    if (address.msigInfo && address.msigInfo.pending) {
      pending = address.msigInfo.pending;
    }

    console.log(address);

    const hasDate = !Utilities.isEmpty(address.timestamp);
    const hasBalance = !Utilities.isEmpty(address.balance);
    const hasType = address.type > 0;

    return (
      <div className="scene">
        <div className="body">
          <div className="scene-multisig-layout">
            <div className="scene-multisig-layout-left">
              <div className="scene-multisig-title">Signers</div>

              {signers.length && (
                <div className="scene-multisig-box">
                  {signers.map((each) => (
                    <div key={each} className="scene-multisig-box-item">
                      {Utilities.getAlias(each, this.props.accounts, false)}
                    </div>
                  ))}
                </div>
              )}

              <div className="scene-multisig-title" style={{ marginTop: 48 }}>
                Pending
              </div>

              {pending.length && (
                <div className="scene-multisig-box">
                  {pending.map((each) => {
                    let approved = (
                      <React.Fragment>
                        {each.Approved.map((each) => {
                          return Utilities.getAlias(each, this.props.accounts, true);
                        })}
                      </React.Fragment>
                    );

                    return (
                      <div key={each} className="scene-multisig-box-item">
                        {approved} ➟ {Utilities.getAlias(each.To, this.props.accounts, true)}
                        <div className="tag tag--value">
                          {Utilities.formatAsFilecoinConversion(each.Value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {address.transactions && address.transactions.length ? (
                <div className="scene-multisig-title" style={{ marginTop: 48, marginBottom: 16 }}>
                  Past Transactions
                </div>
              ) : null}
              <Transactions
                accounts={this.props.accounts}
                onGetMessage={this.props.onGetMessage}
                onGetActorCode={this.props.onGetActorCode}
                onDeserializeParams={this.props.onDeserializeParams}
                address={address}
              />
            </div>

            <div className="scene-multisig-layout-right">
              <div className="scene-multisig-title" style={{ marginTop: 4 }}>
                Account Information
              </div>

              <div className="body-inline-card" style={{ marginTop: 24 }}>
                <QRCode value={"fil:" + address.address} />
              </div>

              <h1 className="body-heading" style={{ marginTop: 54 }}>
                {address.address}
              </h1>
              <p className="body-paragraph">Address</p>

              {hasType ? (
                <React.Fragment>
                  <h2 className="body-heading" style={{ marginTop: 24 }}>
                    {this.props.icon}&nbsp;{Constants.WALLET_ADDRESS_TYPES[address.type]}
                  </h2>
                  <p className="body-paragraph">Type</p>
                </React.Fragment>
              ) : null}

              {hasBalance ? (
                <React.Fragment>
                  <h2 className="body-heading" style={{ marginTop: 24 }}>
                    {Utilities.formatAsFilecoinConversion(address.balance)}
                  </h2>
                  <p className="body-paragraph">Balance</p>
                </React.Fragment>
              ) : null}

              {hasDate ? (
                <React.Fragment>
                  <h2 className="body-heading" style={{ marginTop: 24 }}>
                    {Utilities.toDate(address.timestamp)}
                  </h2>
                  <p className="body-paragraph">Last updated</p>
                </React.Fragment>
              ) : null}

              <div style={{ marginTop: 16 }}>
                <Button
                  loading={this.props.refreshing}
                  onClick={() => this.props.onRefresh({ address: address.address })}
                >
                  Refresh
                </Button>
              </div>

              <Input
                onChange={this.props.onAliasChange}
                value={this.props.alias}
                name="alias"
                title="Alias"
                description="Give your address an alias to make it easier to remember."
                style={{ marginTop: 48 }}
              ></Input>

              <h2 className="body-heading-two" style={{ marginTop: 48 }}>
                Delete this address
              </h2>
              <p className="body-paragraph">
                This will remove this address from your wallet. You can add it back later.
              </p>

              <div style={{ marginTop: 24 }}>
                <Button onClick={() => this.props.onDeleteAddress({ address: address.address })}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
