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

  it('displays error if an incorrect config is passed in', () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

    ExtractTextPlugin.extract({ style: 'file.css' });

    expect(consoleError).toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
  });
});
