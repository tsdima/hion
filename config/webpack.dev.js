const webpackCommon = require('./webpack.config');
const path = require('path');

module.exports = {
  ...webpackCommon,
  devtool: "inline-source-map",
  mode: "development"
};