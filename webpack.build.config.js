const webpack = require("webpack");
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

const DEFAULT_WEBPACK_INCLUDE_PATH = path.resolve(__dirname, "src");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        include: DEFAULT_WEBPACK_INCLUDE_PATH,
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
        include: DEFAULT_WEBPACK_INCLUDE_PATH,
      },
    ],
  },
  target: "electron-renderer",
  plugins: [
    new HTMLWebpackPlugin({ title: "Filecoin Wallets" }),
    new MiniCSSExtractPlugin({
      filename: "bundle.css",
      chunkFilename: "[id].css",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    new MinifyPlugin(),
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false,
  },
};
