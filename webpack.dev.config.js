const webpack = require("webpack");
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const { spawn } = require("child_process");

const DEFAULT_WEBPACK_INCLUDE_PATH = path.resolve(__dirname, "src");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "postcss-loader" }],
        include: [
          DEFAULT_WEBPACK_INCLUDE_PATH,
          path.resolve(__dirname, "node_modules/monaco-editor"),
        ],
      },
      {
        test: /\.jsx?$/,
        use: [{ loader: "babel-loader" }],
        include: DEFAULT_WEBPACK_INCLUDE_PATH,
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: "file-loader?name=img/[name]__[hash:base64:5].[ext]" }],
        include: DEFAULT_WEBPACK_INCLUDE_PATH,
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]" }],
        include: [
          DEFAULT_WEBPACK_INCLUDE_PATH,
          path.resolve(__dirname, "node_modules/monaco-editor"),
        ],
      },
    ],
  },
  target: "electron-renderer",
  plugins: [
    new HTMLWebpackPlugin({ template: "src/index.html" }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
  ],
  devtool: "cheap-source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    stats: {
      colors: true,
      chunks: false,
      children: false,
    },
    before() {
      spawn("electron", ["."], { shell: true, env: process.env, stdio: "inherit" })
        .on("close", (code) => process.exit(0))
        .on("error", (spawnError) => console.error(spawnError));
    },
  },
};
