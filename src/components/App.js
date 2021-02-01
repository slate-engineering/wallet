import * as React from "react";
import * as SVG from "./SVG.js";
import * as Utilities from "../common/utilities";

import { ipcRenderer } from "electron";

import "./App.css";

export default class App extends React.Component {
  state = {};

  async componentDidMount() {
    // const result = await ipcRenderer.invoke("get-state");
    this.setState(result);
  }

  render() {
    console.log(this.state);

    return <React.Fragment>Hello World</React.Fragment>;
  }
}
