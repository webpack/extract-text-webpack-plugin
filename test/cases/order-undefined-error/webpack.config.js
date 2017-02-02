var ExtractTextPlugin = require("../../../");
module.exports = {
  entry: "./index.js",
  module: {
    loaders: [{
      test: /\.css$/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style',
        loader: 'css?modules'
      })
    }]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'file.css',
      ignoreOrder: true
    })
  ]
}
