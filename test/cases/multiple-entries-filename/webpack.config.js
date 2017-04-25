var ExtractTextPlugin = require("../../../");
module.exports = {
	entry: {
		'js/a': "./a",
		'js/b': "./b"
	},
	plugins: [
		new ExtractTextPlugin({
			filename:  (getPath) => {
				return getPath('txt/[name].txt').replace('txt/js', '');
			},
			allChunks: true
		})
	]
};