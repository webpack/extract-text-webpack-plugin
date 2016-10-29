var ExtractTextPlugin = require("../../../");
module.exports = {
	entry: "./index",
	module: {
		loaders: [
			{ test: /\.css$/, loader: ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				loader: { loader: "css-loader", options: {
					sourceMap: true
				} }
			}) }
		]
	},
	devtool: "source-map",
	plugins: [
		new ExtractTextPlugin("file.css")
	]
};
