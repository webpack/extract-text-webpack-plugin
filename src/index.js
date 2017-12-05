import fs from 'fs';
import path from 'path';
import Chunk from 'webpack/lib/Chunk';
import { ConcatSource } from 'webpack-sources';
import async from 'async';
import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import ExtractTextPluginCompilation from './lib/ExtractTextPluginCompilation';
import OrderUndefinedError from './lib/OrderUndefinedError';
import {
  isInitialOrHasNoParents,
  isInvalidOrder,
  getOrder,
  getLoaderObject,
  mergeOptions,
  isString,
  isFunction,
} from './lib/helpers';

const NS = path.dirname(fs.realpathSync(__filename));

let nextId = 0;

class ExtractTextPlugin {
  constructor(options) {
    if (isString(options)) {
      options = { filename: options };
    } else {
      validateOptions(
        path.resolve(__dirname, './plugin.json'),
        options,
        'Extract Text Plugin'
      );
    }
    this.filename = options.filename;
    this.id = options.id != null ? options.id : ++nextId;
    this.options = {};
    mergeOptions(this.options, options);
    delete this.options.filename;
    delete this.options.id;
  }

  static loader(options) {
    return { loader: require.resolve('./loader'), options };
  }

  applyAdditionalInformation(source, info) {
    if (info) {
      return new ConcatSource(`@media ${info[0]} {`, source, '}');
    }
    return source;
  }

  loader(options) {
    return ExtractTextPlugin.loader(mergeOptions({ id: this.id }, options));
  }

  mergeNonInitialChunks(chunk, intoChunk, checkedChunks) {
    if (!intoChunk) {
      checkedChunks = [];
      chunk.chunks.forEach((c) => {
        if (isInitialOrHasNoParents(c)) return;
        this.mergeNonInitialChunks(c, chunk, checkedChunks);
      }, this);
    } else if (checkedChunks.indexOf(chunk) < 0) {
      checkedChunks.push(chunk);
      chunk.forEachModule((module) => {
        intoChunk.addModule(module);
        module.addChunk(intoChunk);
      });
      chunk.chunks.forEach((c) => {
        if (isInitialOrHasNoParents(c)) return;
        this.mergeNonInitialChunks(c, intoChunk, checkedChunks);
      }, this);
    }
  }

  renderExtractedChunk(chunk) {
    const source = new ConcatSource();
    chunk.forEachModule((module) => {
      const moduleSource = module.source();
      source.add(
        this.applyAdditionalInformation(
          moduleSource,
          module.additionalInformation
        )
      );
    }, this);
    return source;
  }

  extract(options) {
    if (
      Array.isArray(options) ||
      isString(options) ||
      typeof options.options === 'object' ||
      typeof options.query === 'object'
    ) {
      options = { use: options };
    } else {
      validateOptions(
        path.resolve(__dirname, './loader.json'),
        options,
        'Extract Text Plugin (Loader)'
      );
    }
    let loader = options.use;
    let before = options.fallback || [];
    if (isString(loader)) {
      loader = loader.split('!');
    }
    if (isString(before)) {
      before = before.split('!');
    } else if (!Array.isArray(before)) {
      before = [before];
    }
    options = mergeOptions({ omit: before.length, remove: true }, options);
    delete options.use;
    delete options.fallback;
    return [this.loader(options)].concat(before, loader).map(getLoaderObject);
  }

  apply(compiler) {
    const options = this.options;
    compiler.plugin('this-compilation', (compilation) => {
      const extractCompilation = new ExtractTextPluginCompilation();
      compilation.plugin('normal-module-loader', (loaderContext, module) => {
        loaderContext[NS] = (content, opt) => {
          if (options.disable) {
            return false;
          }
          if (!Array.isArray(content) && content != null) {
            throw new Error(
              `Exported value was not extracted as an array: ${JSON.stringify(
                content
              )}`
            );
          }
          module[NS] = {
            content,
            options: opt || {},
          };
          return options.allChunks || module[`${NS}/extract`]; // eslint-disable-line no-path-concat
        };
      });
      const filename = this.filename;
      const id = this.id;
      let extractedChunks;
      compilation.plugin('optimize-tree', (chunks, modules, callback) => {
        extractedChunks = chunks.map(() => new Chunk());
        chunks.forEach((chunk, i) => {
          const extractedChunk = extractedChunks[i];
          extractedChunk.index = i;
          extractedChunk.originalChunk = chunk;
          extractedChunk.name = chunk.name;
          extractedChunk.entrypoints = chunk.entrypoints;
          chunk.chunks.forEach((c) => {
            extractedChunk.addChunk(extractedChunks[chunks.indexOf(c)]);
          });
          chunk.parents.forEach((c) => {
            extractedChunk.addParent(extractedChunks[chunks.indexOf(c)]);
          });
        });
        async.forEach(
          chunks,
          (chunk, callback) => {
            // eslint-disable-line no-shadow
            const extractedChunk = extractedChunks[chunks.indexOf(chunk)];
            const shouldExtract = !!(
              options.allChunks || isInitialOrHasNoParents(chunk)
            );
            chunk.sortModules();
            async.forEach(
              chunk.mapModules((c) => c),
              (module, callback) => {
                // eslint-disable-line no-shadow
                let meta = module[NS];
                if (meta && (!meta.options.id || meta.options.id === id)) {
                  const wasExtracted = Array.isArray(meta.content);
                  // A stricter `shouldExtract !== wasExtracted` check to guard against cases where a previously extracted
                  // module would be extracted twice. Happens when a module is a dependency of an initial and a non-initial
                  // chunk. See issue #604
                  if (shouldExtract && !wasExtracted) {
                    module[`${NS}/extract`] = shouldExtract; // eslint-disable-line no-path-concat
                    compilation.rebuildModule(module, (err) => {
                      if (err) {
                        compilation.errors.push(err);
                        return callback();
                      }
                      meta = module[NS];
                      // Error out if content is not an array and is not null
                      if (
                        !Array.isArray(meta.content) &&
                        meta.content != null
                      ) {
                        err = new Error(
                          `${module.identifier()} doesn't export content`
                        );
                        compilation.errors.push(err);
                        return callback();
                      }
                      if (meta.content) {
                        extractCompilation.addResultToChunk(
                          module.identifier(),
                          meta.content,
                          module,
                          extractedChunk
                        );
                      }
                      callback();
                    });
                  } else {
                    if (meta.content) {
                      extractCompilation.addResultToChunk(
                        module.identifier(),
                        meta.content,
                        module,
                        extractedChunk
                      );
                    }
                    callback();
                  }
                } else callback();
              },
              (err) => {
                if (err) return callback(err);
                callback();
              }
            );
          },
          (err) => {
            if (err) return callback(err);
            extractedChunks.forEach((extractedChunk) => {
              if (isInitialOrHasNoParents(extractedChunk)) {
                this.mergeNonInitialChunks(extractedChunk);
              }
            }, this);
            extractedChunks.forEach((extractedChunk) => {
              if (!isInitialOrHasNoParents(extractedChunk)) {
                extractedChunk.forEachModule((module) => {
                  extractedChunk.removeModule(module);
                });
              }
            });
            compilation.applyPlugins(
              'optimize-extracted-chunks',
              extractedChunks
            );
            callback();
          }
        );
      });
      compilation.plugin('additional-assets', (callback) => {
        extractedChunks.forEach((extractedChunk) => {
          if (extractedChunk.getNumberOfModules()) {
            extractedChunk.sortModules((a, b) => {
              if (!options.ignoreOrder && isInvalidOrder(a, b)) {
                compilation.errors.push(
                  new OrderUndefinedError(a.getOriginalModule())
                );
                compilation.errors.push(
                  new OrderUndefinedError(b.getOriginalModule())
                );
              }
              return getOrder(a, b);
            });
            const chunk = extractedChunk.originalChunk;
            const source = this.renderExtractedChunk(extractedChunk);

            const getPath = (format) =>
              compilation
                .getPath(format, {
                  chunk,
                })
                .replace(
                  /\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/gi,
                  function() {
                    // eslint-disable-line func-names
                    return loaderUtils.getHashDigest(
                      source.source(),
                      arguments[1],
                      arguments[2],
                      parseInt(arguments[3], 10)
                    );
                  }
                );

            const file = isFunction(filename)
              ? filename(getPath)
              : getPath(filename);

            compilation.assets[file] = source;
            chunk.files.push(file);
          }
        }, this);
        callback();
      });
    });
  }
}

ExtractTextPlugin.extract = ExtractTextPlugin.prototype.extract.bind(
  ExtractTextPlugin
);

export default ExtractTextPlugin;
