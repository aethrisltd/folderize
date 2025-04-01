const RemovePlugin = require('remove-files-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new RemovePlugin({
        before: {
          include: [
            path.join(".", "node_modules", "pdf-parse", ".vscode"),
            path.join(".", "node_modules", "pdf-parse", "test")
          ]        
      },
    }),
    new webpack.NormalModuleReplacementPlugin(
      /pdf-parse[\\\/]index.js/,
     require.resolve('./src/lib/pdf-parse-index-replacment.js'),
    ),
    new CopyWebpackPlugin(
      {
        patterns: [
          {
            from: path.resolve(__dirname, "src", "icons"),
            to: path.resolve(__dirname, '.webpack', "main", "icons")
          }
        ]
      }
    ),
  ]
};
