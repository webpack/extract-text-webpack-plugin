var ExtractTextPlugin = require("../../../");
module.exports = {
	entry: "./index",
	module: {
		loaders: [
			{ test: /\.css$/, loader: ExtractTextPlugin.extract({
				fallbackLoader: { loader: "style-loader" },
				loader: { loader: "css-loader", query: {
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
