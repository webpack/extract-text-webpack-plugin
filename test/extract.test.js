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
				ExtractTextPlugin.extract({use: 'css-loader'});
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
			ExtractTextPlugin.extract("css-loader").should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a chained loader string", function() {
			ExtractTextPlugin.extract(
				"css-loader!postcss-loader!sass-loader"
			).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader" },
				{ loader: "postcss-loader" },
				{ loader: "sass-loader" }
			]);
		});

		it("accepts an array of loader names", function() {
			ExtractTextPlugin.extract(
				["css-loader", "postcss-loader", "sass-loader"]
			).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader" },
				{ loader: "postcss-loader" },
				{ loader: "sass-loader" }
			]);
		});

		it("accepts a loader object", function() {
			ExtractTextPlugin.extract({ use: "css-loader" }).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a loader object with an options object", function() {
			ExtractTextPlugin.extract(
				{ use: "css-loader", options: { modules: true } }
			).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ use: "css-loader", options: { modules: true } }
			]);
		});

		it("accepts a loader object with a (legacy) query object", function() {
			ExtractTextPlugin.extract(
				{ use: "css-loader", query: { modules: true } }
			).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ use: "css-loader", query: { modules: true } }
			]);
		});

		it("accepts a loader object with a legacy loader field", function() {
			ExtractTextPlugin.extract(
				{ loader: "css-loader", query: { modules: true } }
			).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader", query: { modules: true } }
			]);
		});

		it("accepts an array of loader objects", function() {
			ExtractTextPlugin.extract([
				{ loader: "css-loader" },
				{ loader: "postcss-loader" },
				{ loader: "sass-loader" }
			]).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader" },
				{ loader: "postcss-loader" },
				{ loader: "sass-loader" }
			]);
		});
	})

	context("specifying fallback", function() {
		it("accepts a fallback string", function() {
			ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 1, remove: true } },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a fallback string with legacy fallbackLoader option", function() {
			ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				use: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 1, remove: true } },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a chained fallback string", function() {
			ExtractTextPlugin.extract({
				fallback: "something-loader!style-loader",
				use: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 2, remove: true } },
				{ loader: "something-loader" },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a fallback object", function() {
		 	ExtractTextPlugin.extract({
				fallback: { loader: "style-loader" },
				use: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 1, remove: true } },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts an array of fallback objects", function() {
			ExtractTextPlugin.extract({
				fallback: [
					{ loader: "something-loader" },
					{ loader: "style-loader" }
				],
				use: "css-loader"
			 }).should.deepEqual([
				{ loader: loaderPath, options: { omit: 2, remove: true } },
				{ loader: "something-loader" },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});
	});

	it("passes additional options to its own loader", function() {
		ExtractTextPlugin.extract({
			fallback: "style-loader",
			use: "css-loader",
			publicPath: "/test"
		}).should.deepEqual([
			{ loader: loaderPath, options: { omit: 1, remove: true, publicPath: "/test" } },
			{ loader: "style-loader" },
			{ loader: "css-loader" }
		]);
	});
});
