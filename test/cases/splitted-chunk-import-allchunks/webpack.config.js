import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index',
  plugins: [
    new ExtractTextPlugin({
      filename: 'file.css',
      allChunks: true,
    }),
  ],
};
