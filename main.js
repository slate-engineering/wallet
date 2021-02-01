const path = require("path");
const dirPath = path.join(__dirname);

require("@babel/register")({
  presets: [[require.resolve("@babel/preset-env")]],
  plugins: [
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
