/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author James Andersen @jandersen78
*/
var loaderUtils = require("loader-utils");
var LibraryTemplatePlugin = require("webpack/lib/LibraryTemplatePlugin");

module.exports = function(source) {
    var id = loaderUtils.parseQuery(this.query).id;

    var stringReplaceOptions = this.options['_string-replace-plugin-options'];
    if(!stringReplaceOptions.hasOwnProperty(id)) {
        this.emitWarning('no replacement options found for id ' + id);
    } else {
        var options = stringReplaceOptions[id];
        this.emitWarning(options.replacements.length + ' replacements found for id ' + id);
        var warn = this.emitWarning;

        if(typeof source === "string") {
            warn(source.substring(0, 100));
            options.replacements.forEach(function(repl) {
                warn('pattern: ' + repl.pattern + ' replacement: ' + repl.replacement);
                source = source.replace(repl.pattern, repl.replacement);
            });
        }
    }

	this.cacheable && this.cacheable();
	return source;
};