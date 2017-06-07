var ExtractTextPlugin = require("../../../");

module.exports = {
  devtool: "sourcemap",
  entry: "./index",
  module: {
    loaders: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: { loader: "style-loader" },
          use: {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          }
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("file.css")
  ]
};
