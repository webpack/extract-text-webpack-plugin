const ExtractTextPlugin = require('../../../');
module.exports = {
  entry: {
    'js/a': './a',
    'js/b': './b',
  },
  plugins: [
    new ExtractTextPlugin({
      filename: getPath => getPath('txt/[name].txt').replace('txt/js', ''),
      allChunks: true,
    }),
  ],
};
