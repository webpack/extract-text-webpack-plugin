const ExtractTextPlugin = require('../../../src/');
module.exports = {
  entry: './index',
  plugins: [
    new ExtractTextPlugin({
      filename: 'file.css',
      allChunks: true,
    }),
  ],
};
