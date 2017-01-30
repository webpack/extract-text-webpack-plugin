var should = require("should");
var ExtractTextPlugin = require("../");

var loaderPath = require.resolve("../loader.js");

describe("ExtractTextPlugin.extract()", function() {
	it("throws if given multiple arguments", function() {
		should.throws(function() {
			ExtractTextPlugin.extract("style-loader", "css-loader");
		});
	});

	context("json schema validation", function() {
		it("does not throw if a filename is specified", function() {
			should.doesNotThrow(function() {
				ExtractTextPlugin.extract("file.css");
			});
		});

		it("does not throw if a correct config object is passed in", function() {
			should.doesNotThrow(function() {
				ExtractTextPlugin.extract({loader: 'css-loader'});
			});
		});

		it("throws if an incorrect config is passed in", function() {
			should.throws(
				function() {
					ExtractTextPlugin.extract({style: 'file.css'});
				},
				function(err) {
					return err.message === 'data[\'style\'] should NOT have additional properties';
				}
			);
		});
	});

	context("specifying loader", function() {
		it("accepts a loader string", function() {
			var result = ExtractTextPlugin.extract("css-loader");

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader" }
				]
			);
		});

		it("accepts a chained loader string", function() {
			var result = ExtractTextPlugin.extract(
				"css-loader!postcss-loader!sass-loader"
			);

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader" },
					{ loader: "postcss-loader" },
					{ loader: "sass-loader" }
				]
			);
		});

		it("accepts an array of loader names", function() {
			var result = ExtractTextPlugin.extract(
				["css-loader", "postcss-loader", "sass-loader"]
			);

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader" },
					{ loader: "postcss-loader" },
					{ loader: "sass-loader" }
				]
			);
		});

		it("accepts a loader object", function() {
			var result = ExtractTextPlugin.extract({ loader: "css-loader" });

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader" }
				]
			);
		});

		it("accepts a loader object with an options object", function() {
			var result = ExtractTextPlugin.extract(
				{ loader: "css-loader", options: { modules: true } }
			);

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader", options: { modules: true } }
				]
			);
		});

		it("accepts a loader object with a (legacy) query object", function() {
			var result = ExtractTextPlugin.extract(
				{ loader: "css-loader", query: { modules: true } }
			);

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader", query: { modules: true } }
				]
			);
		});

		it("accepts an array of loader objects", function() {
			var result = ExtractTextPlugin.extract([
				{ loader: "css-loader" },
				{ loader: "postcss-loader" },
				{ loader: "sass-loader" }
			]);

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 0, remove:true } },
					{ loader: "css-loader" },
					{ loader: "postcss-loader" },
					{ loader: "sass-loader" }
				]
			);
		});
	})

	context("specifying fallbackLoader", function() {
		it("accepts a fallbackLoader string", function() {
			var result = ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				loader: "css-loader"
			});

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 1, remove: true } },
					{ loader: "style-loader" },
					{ loader: "css-loader" }
				]
			);
		});

		it("accepts a chained fallbackLoader string", function() {
			var result = ExtractTextPlugin.extract({
				fallbackLoader: "something-loader!style-loader",
				loader: "css-loader"
			});

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 2, remove: true } },
					{ loader: "something-loader" },
					{ loader: "style-loader" },
					{ loader: "css-loader" }
				]
			);
		});

		it("accepts a fallbackLoader object", function() {
			var result = ExtractTextPlugin.extract({
				fallbackLoader: { loader: "style-loader" },
				loader: "css-loader"
			});

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 1, remove: true } },
					{ loader: "style-loader" },
					{ loader: "css-loader" }
				]
			);
		});

		it("accepts an array of fallbackLoader objects", function() {
			var result = ExtractTextPlugin.extract({
				fallbackLoader: [
					{ loader: "something-loader" },
					{ loader: "style-loader" }
				],
				loader: "css-loader"
			});

			delete result.toString;

			should.deepEqual(
				result,
				[
					{ loader: loaderPath, options: { omit: 2, remove: true } },
					{ loader: "something-loader" },
					{ loader: "style-loader" },
					{ loader: "css-loader" }
				]
			);
		});
	});

	it("passes additional options to its own loader", function() {
		var result = ExtractTextPlugin.extract({
			fallbackLoader: "style-loader",
			loader: "css-loader",
			publicPath: "/test"
		});

		delete result.toString;

		should.deepEqual(
			result,
			[
				{ loader: loaderPath, options: { omit: 1, remove: true, publicPath: "/test" } },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]
		);
	});

	it("implements custom toString", function() {
		var result = ExtractTextPlugin.extract({
			fallbackLoader: "style-loader",
			loader: "css-loader",
			publicPath: "/test"
		});

		should.equal(
			result.toString(),
			process.cwd() + '/loader.js?omit=1&remove=true&publicPath=%2Ftest!style-loader?!css-loader?'
		);
	});
});
