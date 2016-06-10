var webpack = require("webpack");
var ExtractTextPlugin = require("../");
module.exports = {
	entry: {
		a: "./entry.js",
		b: "./entry2.js"
	},
	output: {
		filename: "[name].js?[hash]-[chunkhash]",
		chunkFilename: "[name].js?[hash]-[chunkhash]",
		path: __dirname + "/assets",
		publicPath: "/assets/"
	},
	module: {
		loaders: [
			{ test: /\.css$/, loaders: [
				"style-loader",
				{ loader: "css-loader", query: {
					sourceMap: true
				} }
			]},
			{ test: /\.png$/, loader: "file-loader" }
		]
	},
	devtool: "source-map",
	plugins: [
		new ExtractTextPlugin("css/[name].css?[hash]-[chunkhash]-[contenthash]-[name]", {
			disable: false,
			allChunks: true
		}),
		new webpack.optimize.CommonsChunkPlugin({name:"c", filename:"c.js"})
	]
};
