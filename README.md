[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]

<div align="center">
  <img width="200" height="200"
    src="https://webpack.github.io/extract-text-webpack-plugin/logo.svg">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Extract Text Plugin</h1>
</div>

<h2 align="center">Install</h2>

```bash
npm install --save-dev extract-text-webpack-plugin
```

<h2 align="center">Usage</h2>

> :warning: For webpack v1, see [the README in the webpack-1 branch](https://github.com/webpack/extract-text-webpack-plugin/blob/webpack-1/README.md).

```js
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: "style-loader",
          loader: "css-loader"
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css");
  ]
}
```

It moves every `require("style.css")` in entry chunks into a separate CSS file. So your styles are no longer inlined into the JS bundle, but separate in a CSS bundle file (`styles.css`). If your total stylesheet volume is big, it will be faster because the CSS bundle is loaded in parallel to the JS bundle.

|Advantages|Caveats|
|:---------|:------|
| Fewer style tags (older IE has a limit) | Additional HTTP request |
| CSS SourceMap (with `devtool: "source-map"` and `extract-text-webpack-plugin?sourceMap`) | Longer compilation time |
| CSS requested in parallel | No runtime public path modification |
| CSS cached separate | No Hot Module Replacement |
| Faster runtime (less code and DOM operations) | ... |

<h2 align="center">Options</h2>

```js
new ExtractTextPlugin(options: filename | object)
```

|Name|Type|Description|
|:--:|:--:|:----------|
|**`id`**|`{String}`|Unique ident for this plugin instance. (For advanced usage only, by default automatically generated)|
|**`filename`**|`{String}`|Name of the result file. May contain `[name]`, `[id]` and `[contenthash]`|
|**`options.allChunks`**|`{Boolean}`|Extract from all additional chunks too (by default it extracts only from the initial chunk(s))|
|**`options.disable`**|`{Boolean}`|Disables the plugin|

* `[name]` name of the chunk
* `[id]` number of the chunk
* `[contenthash]` hash of the content of the extracted file

> :warning: `ExtractTextPlugin` generates a file **per entry**, so you must use `[name]`, `[id]` or `[contenthash]` when using multiple entries.

#### `#extract`

```js
ExtractTextPlugin.extract(options: loader | object)
```

Creates an extracting loader from an existing loader. Supports loaders of type `{ loader: string; query: object }`.

|Name|Type|Description|
|:--:|:--:|:----------|
|**`options.loader`**|`{String}`/`{Object}`|Loader(s) that should be used for converting the resource to a CSS exporting module _(required)_|
|**`options.fallbackLoader`**|`{String}`/`{Object}`|loader(e.g `'style-loader'`) that should be used when the CSS is not extracted (i.e. in an additional chunk when `allChunks: false`)|
|**`options.publicPath`**|`{String}`|Override the `publicPath` setting for this loader|


#### Multiple Instances

There is also an `extract` function on the instance. You should use this if you have more than one instance of  `ExtractTextPlugin`.

```js
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Create multiple instances
const extractCSS = new ExtractTextPlugin('stylesheets/[name].css');
const extractLESS = new ExtractTextPlugin('stylesheets/[name].less');

module.exports = {
  module: {
    use: [
      {
        test: /\.css$/,
        loader: extractCSS.extract([ 'css-loader', 'postcss-loader' ])
      },
      {
        test: /\.html$/i,
        loader: extractLESS.extract([ 'css-loader', 'less-loader' ])
      },
    ]
  },
  plugins: [
    extractCSS,
    extractLESS
  ]
};
```

<h2 align="center">Maintainer</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150 height="150" src="https://github.com/sokra.png?s=150">
        <br>
        <a href="https://github.com/sokra">Tobias Koppers</a>
      </td>
    <tr>
  <tbody>
</table>


[npm]: https://img.shields.io/npm/v/extract-text-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/extract-text-webpack-plugin

[node]: https://img.shields.io/node/v/extract-text-webpack-plugin.svg
[node-url]: https://nodejs.org

[deps]: https://david-dm.org/webpack/extract-text-webpack-plugin.svg
[deps-url]: https://david-dm.org/webpack/extract-text-webpack-plugin

[tests]: http://img.shields.io/travis/webpack/extract-text-webpack-plugin.svg
[tests-url]: https://travis-ci.org/webpack/extract-text-webpack-plugin

[cover]: https://coveralls.io/repos/github/webpack/extract-text-webpack-plugin/badge.svg
[cover-url]: https://coveralls.io/github/webpack/extract-text-webpack-plugin

[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack
