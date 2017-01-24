var should = require("should");
var ExtractTextPlugin = require("../");

var loaderPath = require.resolve("../loader.js");

describe("ExtractTextPlugin.extract()", function() {
	it("throws if given multiple arguments", function() {
		should.throws(function() {
			ExtractTextPlugin.extract("style-loader", "css-loader");
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
			ExtractTextPlugin.extract({ loader: "css-loader" }).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a loader object with an options object", function() {
			ExtractTextPlugin.extract(
				{ loader: "css-loader", options: { modules: true } }
			).should.deepEqual([
				{ loader: loaderPath, options: { omit: 0, remove:true } },
				{ loader: "css-loader", options: { modules: true } }
			]);
		});

		it("accepts a loader object with a (legacy) query object", function() {
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

	context("specifying fallbackLoader", function() {
		it("accepts a fallbackLoader string", function() {
			ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				loader: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 1, remove: true } },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a chained fallbackLoader string", function() {
			ExtractTextPlugin.extract({
				fallbackLoader: "something-loader!style-loader",
				loader: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 2, remove: true } },
				{ loader: "something-loader" },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts a fallbackLoader object", function() {
		 	ExtractTextPlugin.extract({
				fallbackLoader: { loader: "style-loader" },
				loader: "css-loader"
			}).should.deepEqual([
				{ loader: loaderPath, options: { omit: 1, remove: true } },
				{ loader: "style-loader" },
				{ loader: "css-loader" }
			]);
		});

		it("accepts an array of fallbackLoader objects", function() {
			ExtractTextPlugin.extract({
				fallbackLoader: [
					{ loader: "something-loader" },
					{ loader: "style-loader" }
				],
				loader: "css-loader"
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
			fallbackLoader: "style-loader",
			loader: "css-loader",
			publicPath: "/test"
		}).should.deepEqual([
			{ loader: loaderPath, options: { omit: 1, remove: true, publicPath: "/test" } },
			{ loader: "style-loader" },
			{ loader: "css-loader" }
		]);
	});
});
