/* eslint-disable */
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import fs from 'fs';
import { ConcatSource } from "webpack-sources";
import async from "async";
import ExtractTextPluginCompilation from "./lib/ExtractTextPluginCompilation";
import Chunk from "webpack/lib/Chunk";
import OrderUndefinedError from "./lib/OrderUndefinedError";
import loaderUtils from "loader-utils";
import validateOptions from 'schema-utils';
import path from 'path';

const NS = fs.realpathSync(__dirname);

let nextId = 0;

class ExtractTextPlugin {
  constructor(options) {
    if (arguments.length > 1) {
      throw new Error("Breaking change: ExtractTextPlugin now only takes a single argument. Either an options " +
        "object *or* the name of the result file.\n" +
        "Example: if your old code looked like this:\n" +
        "    new ExtractTextPlugin('css/[name].css', { disable: false, allChunks: true })\n\n" +
        "You would change it to:\n" +
        "    new ExtractTextPlugin({ filename: 'css/[name].css', disable: false, allChunks: true })\n\n" +
        "The available options are:\n" +
        "    filename: string\n" +
        "    allChunks: boolean\n" +
        "    disable: boolean\n" +
        "    ignoreOrder: boolean\n");
    }
    if (isString(options)) {
      options = { filename: options };
    } else {
      validateOptions(path.resolve(__dirname, './schema/plugin.json'), options, 'Extract Text Plugin');
    }
    this.filename = options.filename;
    this.id = options.id != null ? options.id : ++nextId;
    this.options = {};
    mergeOptions(this.options, options);
    delete this.options.filename;
    delete this.options.id;
  }

  loader(options) {
    return ExtractTextPlugin.loader(mergeOptions({ id: this.id }, options));
  }

  extract(options) {
    if (arguments.length > 1) {
      throw new Error("Breaking change: extract now only takes a single argument. Either an options " +
        "object *or* the loader(s).\n" +
        "Example: if your old code looked like this:\n" +
        "    ExtractTextPlugin.extract('style-loader', 'css-loader')\n\n" +
        "You would change it to:\n" +
        "    ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })\n\n" +
        "The available options are:\n" +
        "    use: string | object | loader[]\n" +
        "    fallback: string | object | loader[]\n" +
        "    publicPath: string\n");
    }
    if (options.fallbackLoader) {
      console.warn('fallbackLoader option has been deprecated - replace with "fallback"');
    }
    if (options.loader) {
      console.warn('loader option has been deprecated - replace with "use"');
    }
    if (Array.isArray(options) || isString(options) || typeof options.options === "object" || typeof options.query === 'object') {
      options = { loader: options };
    } else {
      validateOptions(path.resolve(__dirname, './schema/loader.json'), options, 'Extract Text Plugin (Loader)');
    }
    let loader = options.use || options.loader;
    let before = options.fallback || options.fallbackLoader || [];
    if (isString(loader)) {
      loader = loader.split("!");
    }
    if (isString(before)) {
      before = before.split("!");
    } else if (!Array.isArray(before)) {
      before = [before];
    }
    options = mergeOptions({ omit: before.length, remove: true }, options);
    delete options.loader;
    delete options.use;
    delete options.fallback;
    delete options.fallbackLoader;
    return [this.loader(options)]
      .concat(before, loader)
      .map(getLoaderObject);
  }

  apply(compiler) {
    const options = this.options;
    compiler.plugin("this-compilation", compilation => {
      const extractCompilation = new ExtractTextPluginCompilation();
      compilation.plugin("normal-module-loader", (loaderContext, module) => {
        loaderContext[NS] = (content, opt) => {
          if (options.disable)
            return false;
          if (!Array.isArray(content) && content != null)
            throw new Error(`Exported value was not extracted as an array: ${JSON.stringify(content)}`);
          module[NS] = {
            content,
            options: opt || {}
          };
          return options.allChunks || module[`${NS}/extract`]; // eslint-disable-line no-path-concat
        };
      });
      const filename = this.filename;
      const id = this.id;
      let extractedChunks;
      let entryChunks;
      let initialChunks;
      compilation.plugin("optimize-tree", (chunks, modules, callback) => {
        extractedChunks = chunks.map(() => new Chunk());
        chunks.forEach((chunk, i) => {
          const extractedChunk = extractedChunks[i];
          extractedChunk.index = i;
          extractedChunk.originalChunk = chunk;
          extractedChunk.name = chunk.name;
          extractedChunk.entrypoints = chunk.entrypoints;
          chunk.chunks.forEach(c => {
            extractedChunk.addChunk(extractedChunks[chunks.indexOf(c)]);
          });
          chunk.parents.forEach(c => {
            extractedChunk.addParent(extractedChunks[chunks.indexOf(c)]);
          });
        });
        async.forEach(chunks, (chunk, callback) => {
          const extractedChunk = extractedChunks[chunks.indexOf(chunk)];
          const shouldExtract = !!(options.allChunks || isInitialOrHasNoParents(chunk));
          async.forEach(chunk.modules.slice(), (module, callback) => {
            let meta = module[NS];
            if (meta && (!meta.options.id || meta.options.id === id)) {
              const wasExtracted = Array.isArray(meta.content);
              if (shouldExtract !== wasExtracted) {
                module[`${NS}/extract`] = shouldExtract; // eslint-disable-line no-path-concat
                compilation.rebuildModule(module, err => {
                  if (err) {
                    compilation.errors.push(err);
                    return callback();
                  }
                  meta = module[NS];
                  // Error out if content is not an array and is not null
                  if (!Array.isArray(meta.content) && meta.content != null) {
                    err = new Error(`${module.identifier()} doesn't export content`);
                    compilation.errors.push(err);
                    return callback();
                  }
                  if (meta.content)
                    extractCompilation.addResultToChunk(module.identifier(), meta.content, module, extractedChunk);
                  callback();
                });
              } else {
                if (meta.content)
                  extractCompilation.addResultToChunk(module.identifier(), meta.content, module, extractedChunk);
                callback();
              }
            } else callback();
          }, err => {
            if (err) return callback(err);
            callback();
          });
        }, err => {
          if (err) return callback(err);
          extractedChunks.forEach(function (extractedChunk) {
            if (isInitialOrHasNoParents(extractedChunk))
              this.mergeNonInitialChunks(extractedChunk);
          }, this);
          extractedChunks.forEach(extractedChunk => {
            if (!isInitialOrHasNoParents(extractedChunk)) {
              extractedChunk.modules.slice().forEach(module => {
                extractedChunk.removeModule(module);
              });
            }
          });
          compilation.applyPlugins("optimize-extracted-chunks", extractedChunks);
          callback();
        });
      });
      compilation.plugin("additional-assets", callback => {
        extractedChunks.forEach(function (extractedChunk) {
          if (extractedChunk.modules.length) {
            extractedChunk.modules.sort((a, b) => {
              if (!options.ignoreOrder && isInvalidOrder(a, b)) {
                compilation.errors.push(new OrderUndefinedError(a.getOriginalModule()));
                compilation.errors.push(new OrderUndefinedError(b.getOriginalModule()));
              }
              return getOrder(a, b);
            });
            const chunk = extractedChunk.originalChunk;
            const source = this.renderExtractedChunk(extractedChunk);

            const getPath = (format) => compilation.getPath(format, {
              chunk
            }).replace(/\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, function () {
              return loaderUtils.getHashDigest(source.source(), arguments[1], arguments[2], parseInt(arguments[3], 10));
            });

            const file = (isFunction(filename)) ? filename(getPath) : getPath(filename);

            compilation.assets[file] = source;
            chunk.files.push(file);
          }
        }, this);
        callback();
      });
    });
  }
}

export default ExtractTextPlugin;

function isInitialOrHasNoParents(chunk) {
  return chunk.isInitial() || chunk.parents.length === 0;
}

function isInvalidOrder(a, b) {
  const bBeforeA = a.getPrevModules().includes(b);
  const aBeforeB = b.getPrevModules().includes(a);
  return aBeforeB && bBeforeA;
}

function getOrder(a, b) {
  const aOrder = a.getOrder();
  const bOrder = b.getOrder();
  if (aOrder < bOrder) return -1;
  if (aOrder > bOrder) return 1;
  const aIndex = a.getOriginalModule().index2;
  const bIndex = b.getOriginalModule().index2;
  if (aIndex < bIndex) return -1;
  if (aIndex > bIndex) return 1;
  const bBeforeA = a.getPrevModules().includes(b);
  const aBeforeB = b.getPrevModules().includes(a);
  if (aBeforeB && !bBeforeA) return -1;
  if (!aBeforeB && bBeforeA) return 1;
  const ai = a.identifier();
  const bi = b.identifier();
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}

function getLoaderObject(loader) {
  if (isString(loader)) {
    return { loader };
  }
  return loader;
}

function mergeOptions(a, b) {
  if (!b) return a;
  Object.keys(b).forEach(key => {
    a[key] = b[key];
  });
  return a;
}

function isString(a) {
  return typeof a === "string";
}

function isFunction(a) {
  return isType('Function', a);
}

function isType(type, obj) {
  return Object.prototype.toString.call(obj) === `[object ${type}]`;
}

ExtractTextPlugin.loader = options => ({
  loader: require.resolve("./loader"),
  options
});

ExtractTextPlugin.prototype.applyAdditionalInformation = (source, info) => {
  if (info) {
    return new ConcatSource(
      `@media ${info[0]} {`,
      source,
      "}"
    );
  }
  return source;
};

ExtractTextPlugin.prototype.mergeNonInitialChunks = function (chunk, intoChunk, checkedChunks) {
  if (!intoChunk) {
    checkedChunks = [];
    chunk.chunks.forEach(function (c) {
      if (isInitialOrHasNoParents(c)) return;
      this.mergeNonInitialChunks(c, chunk, checkedChunks);
    }, this);
  } else if (!checkedChunks.includes(chunk)) {
    checkedChunks.push(chunk);
    chunk.modules.slice().forEach(module => {
      intoChunk.addModule(module);
      module.addChunk(intoChunk);
    });
    chunk.chunks.forEach(function (c) {
      if (isInitialOrHasNoParents(c)) return;
      this.mergeNonInitialChunks(c, intoChunk, checkedChunks);
    }, this);
  }
};

ExtractTextPlugin.prototype.renderExtractedChunk = function (chunk) {
  const source = new ConcatSource();
  chunk.modules.forEach(function (module) {
    const moduleSource = module.source();
    source.add(this.applyAdditionalInformation(moduleSource, module.additionalInformation));
  }, this);
  return source;
};

ExtractTextPlugin.extract = ExtractTextPlugin.prototype.extract.bind(ExtractTextPlugin);
