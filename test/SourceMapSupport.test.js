var should = require('should');
var sourceMapSupport = require('../lib/SourceMapSupport');

describe('SourceMapSupportTestCases', function() {
	it('should add sourceMap query parameter to "css-loader" [loader string]', function() {
		var loaders = [{
			loader: 'style-loader!css-loader!less-loader'
		}];

		var result = sourceMapSupport.applyParam(loaders);
		result[0].loader.should.equal('style-loader!css-loader?sourceMap!less-loader');
	});

	it('should add sourceMap query parameter to "css-loader" [loaders array]', function() {
		var loaders = [{
			loaders: [
				'style-loader',
				'css-loader',
				'less-loader'
			]
		}];

		var result = sourceMapSupport.applyParam(loaders);
		should.deepEqual([
			'style-loader',
			'css-loader?sourceMap',
			'less-loader'
		], result[0].loaders);
	});

	it('should add sourceMap query parameter to "css" [loader string]', function() {
		var loaders = [{
			loader: 'style!css!less'
		}];

		var result = sourceMapSupport.applyParam(loaders);
		result[0].loader.should.equal('style!css?sourceMap!less');
	});

	it('should add sourceMap query parameter to "css" [loaders array]', function() {
		var loaders = [{
			loaders: [
				'style',
				'css',
				'less'
			]
		}];

		var result = sourceMapSupport.applyParam(loaders);
		should.deepEqual([
			'style',
			'css?sourceMap',
			'less'
		], result[0].loaders);
	});

	it('should not add sourceMap query parameter to "css-loader" with pre-existing params [loader string]', function() {
		var loaders = [{
			loader: 'style-loader!css-loader?blah!less-loader'
		}];

		var result = sourceMapSupport.applyParam(loaders);
		result[0].loader.should.equal('style-loader!css-loader?blah!less-loader');
	});
});
