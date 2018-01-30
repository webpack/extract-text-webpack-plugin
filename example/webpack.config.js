const ExtractTextPlugin = require('../');

module.exports = {
  entry: {
    a: './entry.js',
    b: './entry2.js',
  },
  output: {
    filename: '[name].js?[hash]-[chunkhash]',
    chunkFilename: '[name].js?[hash]-[chunkhash]',
    path: `${__dirname}/assets`,
    publicPath: '/assets/',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          publicPath: '../',
        }),
      },
      { test: /\.png$/, loader: 'file-loader' },
    ],
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'c',
    },
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/[name].css?[hash]-[chunkhash]-[contenthash]-[name]',
      disable: false,
      allChunks: true,
    }),
  ],
};
