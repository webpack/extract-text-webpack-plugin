const ExtractTextPlugin = require('../../../src/');
module.exports = {
  entry: {
    a: './a',
    b: './b',
  },
  plugins: [
    new ExtractTextPlugin('[name].txt'),
  ],
};
