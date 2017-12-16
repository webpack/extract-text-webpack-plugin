import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index',
  module: {
    rules: [
      { test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: { loader: 'css-loader',
            options: {
              sourceMap: true,
            } },
        }) },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new ExtractTextPlugin('file.css'),
  ],
};
