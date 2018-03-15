import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index',
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'async',
          test: /async-chunk-(a|b)/,
        },
      },
    },
    runtimeChunk: true
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
  ],
};
