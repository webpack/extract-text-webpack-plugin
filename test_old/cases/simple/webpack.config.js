import ExtractTextPlugin from '../../../src/';

module.exports = {
  entry: './index',
  plugins: [
    new ExtractTextPlugin('file.css'),
  ],
};
