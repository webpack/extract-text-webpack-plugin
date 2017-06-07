var ExtractTextPlugin = require("../../../");

module.exports = {
  devtool: "sourcemap",
  entry: "./index",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
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
