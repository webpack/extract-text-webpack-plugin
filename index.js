/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var RawSource = require("webpack/lib/RawSource");
var Template = require("webpack/lib/Template");
var async = require("async");

var nextId = 0;

function ExtractTextPlugin(id, filename, options) {
	if(typeof filename !== "string") {
		options = filename;
		filename = id;
		id = ++nextId;
	}
	if(!options) options = {};
	this.filename = filename;
	this.options = options;
	this.id = id;
}
module.exports = ExtractTextPlugin;

ExtractTextPlugin.loader = function(options) {
	return require.resolve("./loader") + (options ? "?" + JSON.stringify(options) : "");
};

ExtractTextPlugin.extract = function(before, loader) {
	if(loader) {
		return [
			ExtractTextPlugin.loader({omit: before.split("!").length, extract: true, remove: true}),
			before,
			loader
		].join("!");
	} else {
		loader = before;
		return [
			ExtractTextPlugin.loader({remove: true}),
			loader
		].join("!");
	}
};

ExtractTextPlugin.prototype.loader = function(options) {
	options = JSON.parse(JSON.stringify(options || {}));
	options.id = this.id;
	return ExtractTextPlugin.loader(options);
};

ExtractTextPlugin.prototype.extract = function(before, loader) {
	if(loader) {
		return [
			this.loader({move: before.split("!").length, extract: true, remove: true}),
			before,
			loader
		].join("!");
	} else {
		loader = before;
		return [
			this.loader({remove: true}),
			loader
		].join("!");
	}
};

ExtractTextPlugin.prototype.apply = function(compiler) {
	var options = this.options;
	compiler.plugin("this-compilation", function(compilation) {
		compilation.plugin("normal-module-loader", function(loaderContext, module) {
			loaderContext[__dirname] = loaderContext.addText = function(text, opt) {
				if(typeof text !== "string" && text !== null)
					throw new Error("Exported value is not a string.");
				module.meta[__dirname] = {
					text: text,
					options: opt
				};
				return options.allChunks || module.meta[__dirname + "/extract"];
			};
		}.bind(this));
		var filename = this.filename;
		var id = this.id;
		compilation.plugin("optimize-tree", function(chunks, modules, callback) {
			var texts = {};
			async.forEach(chunks, function(chunk, callback) {
				var shouldExtract = !!(options.allChunks || chunk.initial);
				var text = [];
				async.forEach(chunk.modules.slice(), function(module, callback) {
					var meta = module.meta && module.meta[__dirname];
					if(meta) {
						var wasExtracted = typeof meta.text === "string";
						if(shouldExtract !== wasExtracted) {
							module.meta[__dirname + "/extract"] = shouldExtract
							compilation.rebuildModule(module, function(err) {
								if(err) {
									compilation.errors.push(err);
									return callback();
								}
								meta = module.meta[__dirname];
								if(typeof meta.text !== "string") {
									var err = new Error(module.identifier() + " doesn't export text");
									compilation.errors.push(err);
									return callback();
								}
								text.push(meta.text);
								callback();
							});
						} else {
							text.push(meta.text);
							callback();
						}
					} else callback();
				}, function(err) {
					if(err) return callback(err);
					if(text.length > 0) {
						var file = filename.replace(Template.REGEXP_NAME, chunk.name);
						texts[file] = (texts[file] || []).concat(text);
					}
					callback();
				}.bind(this));
			}.bind(this), function(err) {
				if(err) return callback(err);
				Object.keys(texts).forEach(function(file) {
					var text = texts[file].join("");
					this.assets[file] = new RawSource(text);
				}.bind(this));
				callback();
			}.bind(this));
		});
	}.bind(this));
};
