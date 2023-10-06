const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const commonConfig = require("./webpack.config.common.js");
const path = require("path");

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "lib");

module.exports = merge(commonConfig, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    watchFiles: [srcPath + "/**/*.html", srcPath + "/**/*.ts", srcPath + "/**/*.js"]
  },
  watchOptions: {
    aggregateTimeout: 500,
    poll: 1000
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        libPath + "/**/*.ts",
        libPath + "/**/*.js",
        libPath + "/**/*.html",
        libPath + "/**/*.css"
      ]
    }),
    new HtmlWebpackPlugin({
      title: "Development",
      template: srcPath + "/index.html",
      inject: "head",
      scriptLoading: "blocking"
    })
  ]
});
