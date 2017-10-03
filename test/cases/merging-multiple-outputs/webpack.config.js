import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: {
    'foo-1': './foo-1',
    'foo-2': './foo-2',
    'bar-1': './bar-1',
    'bar-2': './bar-2',
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].txt',
      allChunks: true,
      merge: [{
        filename: 'foo.txt',
        test: /foo/,
        originals: true,
      }, {
        filename: 'bar.txt',
        test: /bar/,
      }]
    }),
  ],
};
