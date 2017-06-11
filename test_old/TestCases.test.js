/* eslint-disable */
import fs from "fs";
import vm from "vm";
import path from "path";
import webpack from "webpack";
import ExtractTextPlugin from "../src";
import should from "should";

const cases = process.env.CASES
  ? process.env.CASES.split(",")
  : fs.readdirSync(path.join(__dirname, "cases"));

describe("Cases", () => {
  cases.forEach(test => {
    it(test, done => {
      const input = path.join(__dirname, "cases", test);
      const output = path.join(__dirname, "build", test);

      const config = path.join(input, "webpack.config.js");
      let options = { entry: { test: "./index.js" } };

      if (fs.existsSync(config)) options = require(config);

      options.context = input;

      if (!options.module) options.module = {};
      if (!options.module.rules) options.module.rules = [
        {
          test: /\.txt$/,
          use: ExtractTextPlugin.extract({ use: ["raw-loader"] })
        }
      ];

      if (!options.output) options.output = { filename: "[name].js" };
      if (!options.output.path) options.output.path = output;

      if (process.env.CASES) {
        console.log(`\nwebpack.${test}.config.js ${JSON.stringify(options, null, 2)}`);
      }

      webpack(options, (err, stats) => {
        if (err) return done(err);
        if (stats.hasErrors()) return done(new Error(stats.toString()));

        const file = path.join(output, "test.js");

        if (fs.existsSync(file)) require(file)(suite);

        const expected = path.join(input, "expected");

        fs.readdirSync(expected).forEach(file => {
          const filePath = path.join(expected, file);
          const actualPath = path.join(output, file);

          readFileOrEmpty(actualPath).should.be.eql(
            readFileOrEmpty(filePath),
            `${file} should be correct`);
        });

        done();
      });
    });
  });
});

function readFileOrEmpty(path) {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch (e) {
    return "";
  }
}
