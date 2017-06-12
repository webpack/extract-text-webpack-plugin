import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: {
    a: './a',
    b: './b',
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].txt',
      allChunks: true,
    }),
  ],
};
