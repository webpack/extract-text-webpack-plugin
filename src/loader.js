import fs from 'fs';
import path from 'path';
import loaderUtils from 'loader-utils';
import NodeTemplatePlugin from 'webpack/lib/node/NodeTemplatePlugin';
import NodeTargetPlugin from 'webpack/lib/node/NodeTargetPlugin';
import LibraryTemplatePlugin from 'webpack/lib/LibraryTemplatePlugin';
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin';
import LimitChunkCountPlugin from 'webpack/lib/optimize/LimitChunkCountPlugin';

const NS = path.dirname(fs.realpathSync(__filename));

export default source => source;

function hmrCode() {
  return (`
if (module.hot) {
  var injectCss = function injectCss(prev, href) {
    var link = prev.cloneNode();
    link.href = href;
    link.onload = function() {
      prev.parentNode.removeChild(prev);
    };
    prev.stale = true;
    prev.parentNode.insertBefore(link, prev);
  };
  module.hot.dispose(function() {
    window.__webpack_reload_css__ = true;
  });
  if (window.__webpack_reload_css__) {
    module.hot.__webpack_reload_css__ = false;
    console.log("[HMR] Reloading stylesheets...");
    var prefix = document.location.protocol + '//' + document.location.host;
    document
      .querySelectorAll("link[href][rel=stylesheet]")
      .forEach(function(link) {
        if (!link.href.match(prefix) || link.stale) return;
        injectCss(link, link.href.split("?")[0] + "?unix=${+new Date()}");
      });
  }
}
  `);
}

export function pitch(request) {
  const query = loaderUtils.getOptions(this) || {};
  let loaders = this.loaders.slice(this.loaderIndex + 1);
  this.addDependency(this.resourcePath);
  // We already in child compiler, return empty bundle
  if (this[NS] === undefined) { // eslint-disable-line no-undefined
    throw new Error(
      '"extract-text-webpack-plugin" loader is used without the corresponding plugin, ' +
      'refer to https://github.com/webpack/extract-text-webpack-plugin for the usage example',
    );
  } else if (this[NS] === false) {
    return '';
  } else if (this[NS](null, query)) {
    if (query.omit) {
      this.loaderIndex += +query.omit + 1;
      request = request.split('!').slice(+query.omit).join('!');
      loaders = loaders.slice(+query.omit);
    }
    let resultSource;
    if (query.remove) {
      resultSource = '// removed by extract-text-webpack-plugin';
      if (process.env.NODE_ENV === 'development') {
        resultSource += hmrCode();
      }
    } else {
      resultSource = undefined; // eslint-disable-line no-undefined
    }

    const childFilename = 'extract-text-webpack-plugin-output-filename'; // eslint-disable-line no-path-concat
    const publicPath = typeof query.publicPath === 'string' ? query.publicPath : this._compilation.outputOptions.publicPath;
    const outputOptions = {
      filename: childFilename,
      publicPath,
    };
    const childCompiler = this._compilation.createChildCompiler(`extract-text-webpack-plugin ${NS} ${request}`, outputOptions);
    childCompiler.apply(new NodeTemplatePlugin(outputOptions));
    childCompiler.apply(new LibraryTemplatePlugin(null, 'commonjs2'));
    childCompiler.apply(new NodeTargetPlugin());
    childCompiler.apply(new SingleEntryPlugin(this.context, `!!${request}`));
    childCompiler.apply(new LimitChunkCountPlugin({ maxChunks: 1 }));
    // We set loaderContext[NS] = false to indicate we already in
    // a child compiler so we don't spawn another child compilers from there.
    childCompiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('normal-module-loader', (loaderContext, module) => {
        loaderContext[NS] = false;
        if (module.request === request) {
          module.loaders = loaders.map((loader) => {
            return ({
              loader: loader.path,
              options: loader.options,
            });
          });
        }
      });
    });

    let source;
    childCompiler.plugin('after-compile', (compilation, callback) => {
      source = compilation.assets[childFilename] && compilation.assets[childFilename].source();

      // Remove all chunk assets
      compilation.chunks.forEach((chunk) => {
        chunk.files.forEach((file) => {
          delete compilation.assets[file];
        });
      });

      callback();
    });
    const callback = this.async();
    childCompiler.runAsChild((err, entries, compilation) => {
      if (err) return callback(err);

      if (compilation.errors.length > 0) {
        return callback(compilation.errors[0]);
      }
      compilation.fileDependencies.forEach((dep) => {
        this.addDependency(dep);
      }, this);
      compilation.contextDependencies.forEach((dep) => {
        this.addContextDependency(dep);
      }, this);
      if (!source) {
        return callback(new Error("Didn't get a result from child compiler"));
      }
      try {
        let text = this.exec(source, request);
        if (typeof text === 'string') {
          text = [[compilation.entries[0].identifier(), text]];
        } else {
          text.forEach((item) => {
            const id = item[0];
            compilation.modules.forEach((module) => {
              if (module.id === id) { item[0] = module.identifier(); }
            });
          });
        }
        this[NS](text, query);
        if (text.locals && typeof resultSource !== 'undefined') {
          resultSource += `\nmodule.exports = ${JSON.stringify(text.locals)};`;
        }
      } catch (e) {
        return callback(e);
      }
      if (resultSource) { callback(null, resultSource); } else { callback(); }
    });
  }
}
