import ExtractTextPlugin from '../../../src/index';

module.exports = {
  entry: './index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'file.css',
      ignoreOrder: true,
    }),
  ],
};
