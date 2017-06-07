var webpack = require("webpack");
var path = require("path");
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
			{ test: /\.css$/, use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: {
					loader: "css-loader",
					options: {
						sourceMap: true
					}
				},
				publicPath: "../"
			}) },
			{ test: /\.(png|eot|woff|woff2|ttf|svg)$/, loader: "file-loader" }
		]
	},
	devtool: "source-map",
	recordsOutputPath: path.join(__dirname, "js", "records.json"),
	plugins: [
		new ExtractTextPlugin({
			filename: "css/[name].css?[hash]-[chunkhash]-[contenthash]-[name]",
			disable: false,
			allChunks: true
		}),
		new webpack.optimize.CommonsChunkPlugin({ name: "c", filename: "c.js" }),
		new webpack.optimize.AggressiveSplittingPlugin({
			minSize: 30000,
            maxSize: 50000
		}),
		new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
	]
};
