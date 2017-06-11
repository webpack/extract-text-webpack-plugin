const webpack = require('webpack');
const ExtractTextPlugin = require('../../../src/index');

module.exports = {
  entry: './index',
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: 'common.js',
      chunks: ['async-chunk-a', 'async-chunk-b'],
    }),
    new ExtractTextPlugin({
      filename: 'file.css',
      allChunks: true,
    }),
  ],
};
