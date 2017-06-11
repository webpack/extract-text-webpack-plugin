import ExtractTextPlugin from '../../../src/';
import webpack from 'webpack';

module.exports = {
  entry: './index.js',
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].txt',
      allChunks: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      minChunks: 2,
    }),
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 51200, // 50ko
    }),
  ],
};
