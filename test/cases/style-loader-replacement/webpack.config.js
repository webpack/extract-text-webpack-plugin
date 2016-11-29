var ExtractTextPlugin = require('../../../');
module.exports = {
	entry: "./index",
	module: {
		loaders: [{
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
			use: {
			  loader: 'css-loader',
			  options: {
				// turn on CSS Modules
				modules: true,
				localIdentName: 'cssmodule-[path]-[name]',
				sourceMap: true
			  }
			}
		  }),
          exclude: /node_modules/
        }]
	},
	devtool: "source-map",
	plugins: [
		new ExtractTextPlugin({filename: 'file.css', allChunks: true})
	]
};

