const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const paths = {
  src: path.resolve(__dirname, '../ts'),
  dist: path.resolve(__dirname, '../dist')
};

module.exports = {
  context: paths.src,
  entry: {
    app: './main'
  },

  output: {
    path: paths.dist,
    filename: '[name].bundle.js'
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html")
    })
  ],

  resolve: {
    extensions: ['.ts'] // указание расширений файлов, которые webpack будет обрабатывать, и пытаться добавить автоматически (например получив запрос на index, не найдет его и попробует index.ts)
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      } // загрузчик для обработки файлов с расширением .ts
    ]
  }
};