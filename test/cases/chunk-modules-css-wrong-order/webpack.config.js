import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index',
  module: {
    loaders: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: { loader: 'style-loader' },
          use: { loader: 'css-loader', },
        })
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('file.css'),
  ],
};
