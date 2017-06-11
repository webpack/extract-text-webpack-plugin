const ExtractTextPlugin = require('../../../src/');
module.exports = {
  entry: './index',
  plugins: [
    new ExtractTextPlugin('file.css'),
  ],
};
