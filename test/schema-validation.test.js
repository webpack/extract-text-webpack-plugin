/* eslint-disable no-unused-expressions */
import ExtractTextPlugin from '../src';

describe('json schema validation', () => {
  it('does not throw if a filename is specified', () => {
    expect(() => {
      ExtractTextPlugin.extract('file.css');
    }).doesNotThrow;
  });

  it('does not throw if a correct config object is passed in', () => {
    expect(() => {
      ExtractTextPlugin.extract({ use: 'css-loader' });
    }).doesNotThrow;
  });

  it('throws if an incorrect config is passed in', () => {
    expect(() => {
      ExtractTextPlugin.extract({ style: 'file.css' });
    }).toThrow();
  });
});
