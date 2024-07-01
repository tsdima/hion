const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const paths = {
  src: path.resolve(__dirname, '../ts'),
  dist: path.resolve(__dirname, '../dist'),
};

module.exports = {
  context: paths.src,
  entry: {
    app: './main.ts'
  },

  output: {
    path: paths.dist,
    filename: '[name].bundle.js'
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html")
    }),
    new MiniCssExtractPlugin({
      linkType: "text/css",
      filename: 'css/styles.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/img', to: 'img' },
        { from: 'js', to: 'js' },
        { from: '../public/cm', to: 'cm' },
        { from: '../lang', to: 'lang' },
        { from: '../pack', to: 'pack' },
        { from: '../gui', to: 'gui' },
      ]
    })
  ],

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ]
  }
};