/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author James Andersen @jandersen78
*/
var ConcatSource = require("webpack/lib/ConcatSource");
var Template = require("webpack/lib/Template");
var async = require("async");
var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;

var nextId = 0;
var opts = {};

function StringReplacePlugin(id, filename, options) {
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
module.exports = StringReplacePlugin;


StringReplacePlugin.loader = function(options) {
    return require.resolve("./loader") + (options ? "?" + JSON.stringify(options) : "");
};

StringReplacePlugin.extract = function(options, loader) {
    var id = Math.random().toString(36).slice(2);
    opts[id] = options;
    var val = [
        require.resolve("./loader") + "?id=" + id //,
        //loader
    ].join("!");

    console.log("loader return val: " + val);
    return val;
};


StringReplacePlugin.prototype.apply = function(compiler) {
	// add the replacement options onto the compiler options
    // so that the loader can refer to them
    compiler.options['_string-replace-plugin-options'] = opts;
};