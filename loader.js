/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var loaderUtils = require("loader-utils");
var NodeTemplatePlugin = require("webpack/lib/node/NodeTemplatePlugin");
var NodeTargetPlugin = require("webpack/lib/node/NodeTargetPlugin");
var LibraryTemplatePlugin = require("webpack/lib/LibraryTemplatePlugin");
var SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
var LimitChunkCountPlugin = require("webpack/lib/optimize/LimitChunkCountPlugin");
var SourceMapConsumer = require("source-map").SourceMapConsumer;
module.exports = function(source) {
	this.cacheable && this.cacheable();
	return source;
};

function fixLineNumbers(e, map) {
	var lines = e.stack.split('\n');
	var sourceMap = new SourceMapConsumer(map);
	for (var i = 1, l = lines.length; i < l; i++) {
		var line = lines[i];
		var lineAndColumn = line.match(/:[0-9]+/g);
		var lineNumber = parseInt(lineAndColumn[0].replace(/:/g, ''), 10);
		var column = parseInt(lineAndColumn[1].replace(/:/g, ''), 10);
		var original = sourceMap.originalPositionFor({line: lineNumber, column: column});
		if (original.source) {
			var opening = line.indexOf('(') + 1;
			var closing = line.indexOf(')');
			lines[i] = line.replace(line.substr(opening, closing - opening),
					original.source + ':' + original.line + ':' + original.column);
		}
	}
	e.stack = lines.join('\n');
}

module.exports.pitch = function(request, preReq, data) {
	this.cacheable && this.cacheable();
	var query = loaderUtils.parseQuery(this.query);
	this.addDependency(this.resourcePath);
	// We already in child compiler, return empty bundle
	if(this[__dirname] === undefined) {
		throw new Error(
			'"extract-text-webpack-plugin" loader is used without the corresponding plugin, ' +
			'refer to https://github.com/webpack/extract-text-webpack-plugin for the usage example'
		);
	} else if(this[__dirname] === false) {
		return "";
	} else if(this[__dirname](null, query)) {
		if(query.omit) {
			this.loaderIndex += +query.omit + 1;
			request = request.split("!").slice(+query.omit).join("!");
		}
		if(query.remove) {
			var resultSource = "// removed by extract-text-webpack-plugin";
		} else {
			var resultSource = undefined;
		}

		if(query.extract !== false) {
			var childFilename = __dirname + " " + request;
			var outputOptions = {
				filename: childFilename,
				publicPath: this._compilation.outputOptions.publicPath
			};
			var childCompiler = this._compilation.createChildCompiler("extract-text-webpack-plugin", outputOptions);
			childCompiler.apply(new NodeTemplatePlugin(outputOptions));
			childCompiler.apply(new LibraryTemplatePlugin(null, "commonjs2"));
			childCompiler.apply(new NodeTargetPlugin());
			childCompiler.apply(new SingleEntryPlugin(this.context, "!!" + request));
			childCompiler.apply(new LimitChunkCountPlugin({ maxChunks: 1 }));
			var subCache = "subcache " + __dirname + " " + request;
			childCompiler.plugin("compilation", function(compilation) {
				if(compilation.cache) {
					if(!compilation.cache[subCache])
						compilation.cache[subCache] = {};
					compilation.cache = compilation.cache[subCache];
				}
			});
			// We set loaderContext[__dirname] = false to indicate we already in
			// a child compiler so we don't spawn another child compilers from there.
			childCompiler.plugin("this-compilation", function(compilation) {
				compilation.plugin("normal-module-loader", function(loaderContext, module) {
					loaderContext[__dirname] = false;
				});
			});
			var source;
			var map;
			childCompiler.plugin("after-compile", function(compilation, callback) {
				var childAsset = compilation.assets[childFilename];
				if (childAsset) {
					source = childAsset.source();
					map = childAsset.map();
				}
				// Remove all chunk assets
				compilation.chunks.forEach(function(chunk) {
					chunk.files.forEach(function(file) {
						delete compilation.assets[file];
					});
				});

				callback();
			}.bind(this))
			var callback = this.async();
			childCompiler.runAsChild(function(err, entries, compilation) {
				if(err) return callback(err);

				if(!source) {
					return callback(new Error("Didn't get a result from child compiler"));
				}
				compilation.fileDependencies.forEach(function(dep) {
					this.addDependency(dep);
				}, this);
				compilation.contextDependencies.forEach(function(dep) {
					this.addContextDependency(dep);
				}, this);
				try {
					var text = this.exec(source, request, map);
					if(typeof text === "string")
						text = [[0, text]];
					text.forEach(function(item) {
						var id = item[0];
						compilation.modules.forEach(function(module) {
							if(module.id === id)
								item[0] = module.identifier();
						});
					});
					this[__dirname](text, query);
				} catch(e) {
					fixLineNumbers(e, map);
					return callback(e);
				}
				if(resultSource)
					callback(null, resultSource);
				else
					callback();
			}.bind(this));
		} else {
			this[__dirname]("", query);
			return resultSource;
		}
	}
};
