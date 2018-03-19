/* eslint-disable
  global-require,
  import/no-dynamic-require,
  consistent-return
*/
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import glob from 'glob';
import ExtractTextPlugin from '../src';

const cases = process.env.CASES
  ? process.env.CASES.split(',')
  : fs.readdirSync(path.join(__dirname, 'cases'));

describe('Webpack Integration Tests', () => {
  cases.forEach((testCase) => {
    it(testCase, (done) => {
      let options = { entry: { test: './index.js' } };
      const testDirectory = path.join(__dirname, 'cases', testCase);
      const outputDirectory = path.join(__dirname, 'js', testCase);
      const configFile = path.join(testDirectory, 'webpack.config.js');

      if (fs.existsSync(configFile)) {
        options = require(configFile);
      }
      options.context = testDirectory;
      if (!options.module) options.module = {};
      if (!options.module.rules) {
        options.module.rules = [
          { test: /\.txt$/, loader: ExtractTextPlugin.extract('raw-loader') },
        ];
      }
      if (!options.output) options.output = { filename: '[name].js' };
      if (!options.output.path) options.output.path = outputDirectory;
      if (process.env.CASES) {
        // eslint-disable-next-line
        console.log(
          `\nwebpack.${testCase}.config.js ${JSON.stringify(options, null, 2)}`
        );
      }

      webpack(options, (err, stats) => {
        if (err) return done(err);
        if (stats.hasErrors()) return done(new Error(stats.toString()));
        const testFile = path.join(outputDirectory, 'test.js');
        if (fs.existsSync(testFile)) {
          require(testFile)(suite);
        }
        const expectedDirectory = path.join(testDirectory, 'expected');

        glob
          .sync('**/*.@(txt|css)', { cwd: outputDirectory })
          .forEach((file) => {
            const filePath = path.join(expectedDirectory, file);
            const actualPath = path.join(outputDirectory, file);
            expect(fs.existsSync(filePath)).toBeTruthy();
            expect(fs.readFileSync(actualPath, 'utf-8')).toEqual(
              fs.readFileSync(filePath, 'utf-8')
            );
            expect(fs.readFileSync(actualPath, 'utf-8')).toMatchSnapshot();
          });
        done();
      });
    });
  });
});
