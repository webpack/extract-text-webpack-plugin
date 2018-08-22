import webpack from 'webpack';
import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index.js',
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].txt',
      allChunks: true,
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      minChunks: 2,
    }),
  ],
};
