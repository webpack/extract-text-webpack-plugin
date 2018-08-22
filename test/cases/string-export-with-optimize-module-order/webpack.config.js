import ExtractTextPlugin from '../../../src/index';

function moduleOrderOptimizer() {
  this.plugin("after-plugins", compiler =>
    compiler.plugin("compilation", compilation =>
      compilation.plugin("optimize-module-order", modules => {
        const index = modules.findIndex(module => module.rawRequest == "./module");
        [modules[0], modules[index]] = [modules[index], modules[0]];
      })));
}

module.exports = {
  entry: ['./a', './b'],
  module: {
    loaders: [
      {
        test: /(a|b)\.js$/,
        use: ExtractTextPlugin.extract('./loader')
      },
    ],
  },
  plugins: [
    moduleOrderOptimizer,
    new ExtractTextPlugin('[name].txt'),
  ],
};
