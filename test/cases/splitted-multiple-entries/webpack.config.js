var ExtractTextPlugin = require("../../../");
module.exports = {
	entry: {
		a: "./a",
		b: "./b"
	},
	plugins: [
		new ExtractTextPlugin({
			filename: "[name].txt",
			allChunks: false
		})
	]
};
