const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "lib");

module.exports = {
  mode: "development",
  entry: srcPath + "/index.ts",
  output: {
    path: libPath,
    filename: "qr-code-styling.js",
    library: "QRCodeStyling",
    libraryTarget: "umd",
    libraryExport: "default",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new ESLintPlugin({
      extensions: [".js", ".ts"]
    })
  ],
  resolve: {
    extensions: [".ts", ".js"]
  }
};
