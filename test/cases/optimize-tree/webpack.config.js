import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index.js',
  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 2,
      minSize: 51200, // 50ko
    },
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].txt',
      allChunks: true,
    }),
  ],
};
