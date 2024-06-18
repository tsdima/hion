const webpackCommon = require('./webpack.config');

module.exports = {
  ...webpackCommon,
  mode: "production",
};