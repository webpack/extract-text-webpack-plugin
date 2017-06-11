/* eslint-disable */
var fs = require("fs");
var vm = require("vm");
var path = require("path");

var webpack = require("webpack");
var ExtractTextPlugin = require("../src");

var should = require("should");

var cases = process.env.CASES
  ? process.env.CASES.split(",")
  : fs.readdirSync(path.join(__dirname, "cases"));

describe("Cases", function() {
  cases.forEach(function(test) {
    it(test, function(done) {
      var input = path.join(__dirname, "cases", test);
      var output = path.join(__dirname, "build", test);

      var config = path.join(input, "webpack.config.js");
      var options = { entry: { test: "./index.js" } };

      if(fs.existsSync(config)) options = require(config);

      options.context = input;

      if(!options.module) options.module = {};
      if(!options.module.rules) options.module.rules = [
        {
          test: /\.txt$/,
          use: ExtractTextPlugin.extract({ use: [ "raw-loader" ] })
        }
      ];

      if(!options.output) options.output = { filename: "[name].js" };
      if(!options.output.path) options.output.path = output;

      if(process.env.CASES) {
        console.log("\nwebpack." + test + ".config.js " + JSON.stringify(options, null, 2));
      }

      webpack(options, function(err, stats) {
        if(err) return done(err);
        if(stats.hasErrors()) return done(new Error(stats.toString()));

        var file = path.join(output, "test.js");

        if(fs.existsSync(file)) require(file)(suite);

        var expected = path.join(input, "expected");

        fs.readdirSync(expected).forEach(function(file) {
          var filePath = path.join(expected, file);
          var actualPath = path.join(output, file);

          readFileOrEmpty(actualPath).should.be.eql(
            readFileOrEmpty(filePath),
            file + " should be correct");
        });

        done();
      });
    });
  });
});

function readFileOrEmpty(path) {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch(e) {
    return "";
  }
}
