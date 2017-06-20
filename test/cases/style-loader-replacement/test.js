var fs = require('fs')
var path = require('path')
var should = require('should')
var dir = path.basename(__dirname)

module.exports = function (describe) {
	describe(dir, function() {
		it('contains compiled class names', function() {
			var outputDirectory = path.join(__dirname, "..", "..", "js", dir);
			var rawJS = fs.readFileSync(path.join(outputDirectory, 'main.js'), 'utf8');
			rawJS.should.match(/\{"a":"cssmodule--a"\}/);
		})
	})
}
