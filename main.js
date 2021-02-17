const path = require("path");
const dirPath = path.join(__dirname);

require("@babel/register")({
  presets: [require.resolve("@babel/preset-env"), require.resolve("@babel/preset-react")],
  plugins: [
    require.resolve("@babel/plugin-proposal-class-properties"),
    require.resolve("@babel/plugin-transform-react-jsx"),
    require.resolve("@babel/plugin-transform-runtime"),
    [
      require.resolve("babel-plugin-module-resolver"),
      {
        alias: {
          "~": dirPath,
        },
      },
    ],
  ],
  ignore: ["node_modules", ".next"],
});

module.exports = require("./electron-server.js");
