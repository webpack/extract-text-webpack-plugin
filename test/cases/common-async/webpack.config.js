import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index',
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'all',
          test: /async-chunk-(a|b)/,
        },
      },
    },
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'file.css',
      allChunks: true,
    }),
  ],
};
