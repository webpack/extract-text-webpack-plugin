import ExtractTextPlugin from '../../../src/index';

module.exports = {
	entry: {
		'homepage': "./entries/homepage.js",
		'contact': "./entries/contact.js"
	},
	module: {
		loaders: [
			{ test: /\.css$/, use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: { loader: "css-loader", options: {
					sourceMap: false
				} }
			}) }
		]
	},
	plugins: [
		new ExtractTextPlugin({
			filename: '[name].css',
			allChunks: false
		})
	]
};
