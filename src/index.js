import fs from 'fs';
import path from 'path';
import Chunk from 'webpack/lib/Chunk';
import { ConcatSource, RawSource, CachedSource } from 'webpack-sources';
import async from 'async';
import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import ExtractTextPluginCompilation from './lib/ExtractTextPluginCompilation';
import {
  isInitialOrHasNoParents,
  getLoaderObject,
  mergeOptions,
  isString,
  isFunction,
} from './lib/helpers';

const NS = path.dirname(fs.realpathSync(__filename));
const plugin = { name: 'ExtractTextPlugin' };

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
    this.id = options.id != null ? options.id : (nextId += 1);
    this.options = {};
    mergeOptions(this.options, options);
    delete this.options.filename;
    delete this.options.id;
  }

  static loader(options) {
    return { loader: require.resolve('./loader'), options };
  }

  static applyAdditionalInformation(source, info) {
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
      const newCheckedChunks = [];

      for (const asyncChunk of chunk.getAllAsyncChunks()) {
        if (!asyncChunk.isOnlyInitial()) {
          this.mergeNonInitialChunks(asyncChunk, chunk, newCheckedChunks);
        }
      }
    } else if (!checkedChunks.includes(chunk)) {
      const newCheckedChunks = checkedChunks.concat(chunk);

      for (const chunkModule of chunk.modulesIterable) {
        intoChunk.addModule(chunkModule);
        chunkModule.addChunk(intoChunk);
      }

      for (const asyncChunk of chunk.getAllAsyncChunks()) {
        if (!asyncChunk.isOnlyInitial()) {
          this.mergeNonInitialChunks(asyncChunk, intoChunk, newCheckedChunks);
        }
      }
    }
  }

  static renderExtractedChunk(chunk) {
    const source = new ConcatSource();

    for (const chunkModule of chunk.modulesIterable) {
      let moduleSource = chunkModule.source();

      if (moduleSource instanceof CachedSource) {
        if (chunkModule[NS] && chunkModule[NS].content) {
          moduleSource = new RawSource(chunkModule[NS].content[0][1]);
        } else {
          moduleSource = null;
        }
      }

      if (moduleSource) {
        source.add(
          ExtractTextPlugin.applyAdditionalInformation(
            moduleSource,
            chunkModule.additionalInformation
          )
        );
      }
    }

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
    const { options, filename, id } = this;

    compiler.hooks.thisCompilation.tap(plugin.name, (compilation) => {
      const extractCompilation = new ExtractTextPluginCompilation();

      compilation.hooks.normalModuleLoader.tap(
        plugin.name,
        (loaderContext, module) => {
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
        }
      );

      let extractedChunks;
      compilation.hooks.optimizeTree.tapAsync(
        plugin.name,
        (chunks, modules, callback) => {
          extractedChunks = chunks.map(() => new Chunk());

          chunks.forEach((chunk, i) => {
            const extractedChunk = extractedChunks[i];
            extractedChunk.index = i;
            extractedChunk.originalChunk = chunk;
            extractedChunk.name = chunk.name;
            // extractedChunk.entryModule = chunk.entryModule;

            for (const chunkGroup of chunk.groupsIterable) {
              extractedChunk.addGroup(chunkGroup);
            }
          });

          async.forEach(
            chunks,
            (chunk, chunkCallback) => {
              // eslint-disable-line no-shadow
              const extractedChunk = extractedChunks[chunks.indexOf(chunk)];
              const shouldExtract = !!(
                options.allChunks || isInitialOrHasNoParents(chunk)
              );
              // chunk.sortModules();

              async.forEach(
                Array.from(chunk.modulesIterable),
                (module, moduleCallback) => {
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

                          return moduleCallback();
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

                          return moduleCallback();
                        }

                        if (meta.content) {
                          extractCompilation.addResultToChunk(
                            module.identifier(),
                            meta.content,
                            module,
                            extractedChunk
                          );
                        }

                        moduleCallback();
                      });

                      return;
                    } else if (meta.content) {
                      extractCompilation.addResultToChunk(
                        module.identifier(),
                        meta.content,
                        module,
                        extractedChunk
                      );
                    }
                  }

                  moduleCallback();
                },
                (err) => {
                  if (err) {
                    return chunkCallback(err);
                  }

                  chunkCallback();
                }
              );
            },
            (err) => {
              if (err) {
                return callback(err);
              }

              extractedChunks.forEach((extractedChunk) => {
                if (isInitialOrHasNoParents(extractedChunk)) {
                  this.mergeNonInitialChunks(extractedChunk);
                }
              }, this);

              extractedChunks.forEach((extractedChunk) => {
                if (!isInitialOrHasNoParents(extractedChunk)) {
                  for (const chunkModule of extractedChunk.modulesIterable) {
                    extractedChunk.removeModule(chunkModule);
                  }
                }
              });

              compilation.hooks.optimizeExtractedChunks.call(extractedChunks);
              callback();
            }
          );
        }
      );

      compilation.hooks.additionalAssets.tapAsync(plugin.name, (assetCb) => {
        extractedChunks.forEach((extractedChunk) => {
          if (extractedChunk.getNumberOfModules()) {
            // extractedChunk.sortModules();

            const chunk = extractedChunk.originalChunk;
            const source = ExtractTextPlugin.renderExtractedChunk(
              extractedChunk
            );

            const getPath = (format) =>
              compilation
                .getPath(format, {
                  chunk,
                })
                .replace(
                  /\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/gi,
                  // eslint-disable-next-line func-names
                  function() {
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

        assetCb();
      });
    });
  }
}

ExtractTextPlugin.extract = ExtractTextPlugin.prototype.extract.bind(
  ExtractTextPlugin
);

export default ExtractTextPlugin;
