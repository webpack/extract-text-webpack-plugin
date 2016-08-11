# extract text plugin for webpack 2

The API has changed since version 1. For the webpack 1 version, see [the README in the webpack-1 branch](https://github.com/webpack/extract-text-webpack-plugin/blob/webpack-1/README.md).

## Usage example with css

``` javascript
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
	module: {
		loaders: [
			{ test: /\.css$/, loader: ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				loader: "css-loader"
			}) }
		]
	},
	plugins: [
		new ExtractTextPlugin("styles.css")
	]
}
```

It moves every `require("style.css")` in entry chunks into a separate css output file. So your styles are no longer inlined into the javascript, but separate in a css bundle file (`styles.css`). If your total stylesheet volume is big, it will be faster because the stylesheet bundle is loaded in parallel to the javascript bundle.

Advantages:

* Fewer style tags (older IE has a limit)
* CSS SourceMap (with `devtool: "source-map"` and `css-loader?sourceMap`)
* CSS requested in parallel
* CSS cached separate
* Faster runtime (less code and DOM operations)

Caveats:

* Additional HTTP request
* Longer compilation time
* More complex configuration
* No runtime public path modification
* No Hot Module Replacement

## API

``` javascript
new ExtractTextPlugin(options: filename | object)
```

* `options.filename: string` _(required)_ the filename of the result file. May contain `[name]`, `[id]` and `[contenthash]`
  * `[name]` the name of the chunk
  * `[id]` the number of the chunk
  * `[contenthash]` a hash of the content of the extracted file
* `options.allChunks: boolean` extract from all additional chunks too (by default it extracts only from the initial chunk(s))
* `options.disable: boolean` disables the plugin
* `options.id: string` Unique ident for this plugin instance. (For advanced usage only, by default automatically generated)

The `ExtractTextPlugin` generates an output file per entry, so you must use `[name]`, `[id]` or `[contenthash]` when using multiple entries.

``` javascript
ExtractTextPlugin.extract(options: loader | object)
```

Creates an extracting loader from an existing loader. Supports loaders of type `{ loader: string; query: object }`.

* `options.loader: string | object | loader[]` _(required)_ the loader(s) that should be used for converting the resource to a css exporting module
* `options.fallbackLoader: string | object | loader[]` the loader(s) that should be used when the css is not extracted (i.e. in an additional chunk when `allChunks: false`)
* `options.publicPath: string` override the `publicPath` setting for this loader

There is also an `extract` function on the instance. You should use this if you have more than one `ExtractTextPlugin`.

```javascript
let ExtractTextPlugin = require('extract-text-webpack-plugin');

// multiple extract instances
let extractCSS = new ExtractTextPlugin('stylesheets/[name].css');
let extractLESS = new ExtractTextPlugin('stylesheets/[name].less');

module.exports = {
  ...
  module: {
    loaders: [
      { test: /\.scss$/i, loader: extractCSS.extract(['css','sass']) },
      { test: /\.less$/i, loader: extractLESS.extract(['css','less']) },
      ...
    ]
  },
  plugins: [
    extractCSS,
    extractLESS
  ]
};
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
