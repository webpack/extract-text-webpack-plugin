var ExtractTextPlugin = require("../../../");
module.exports = {
	entry: "./index",
	module: {
		loaders: [
			{ test: /\.css$/, use: ExtractTextPlugin.extract({
				fallbackLoader: { loader: "style-loader" },
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
