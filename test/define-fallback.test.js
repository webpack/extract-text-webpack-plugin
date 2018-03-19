import ExtractTextPlugin from '../src';

const loader = require.resolve('../src/loader');

describe('Define Fallback', () => {
  it('accepts a fallback string', () => {
    expect(
      ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader',
      })
    ).toEqual([
      { loader, options: { omit: 1, remove: true } },
      { loader: 'style-loader' },
      { loader: 'css-loader' },
    ]);
  });

  it('accepts a fallback string with legacy fallbackLoader option', () => {
    expect(
      ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader',
      })
    ).toEqual([
      { loader, options: { omit: 1, remove: true } },
      { loader: 'style-loader' },
      { loader: 'css-loader' },
    ]);
  });

  it('accepts a chained fallback string', () => {
    expect(
      ExtractTextPlugin.extract({
        fallback: 'something-loader!style-loader',
        use: 'css-loader',
      })
    ).toEqual([
      { loader, options: { omit: 2, remove: true } },
      { loader: 'something-loader' },
      { loader: 'style-loader' },
      { loader: 'css-loader' },
    ]);
  });

  it('accepts a fallback object', () => {
    expect(
      ExtractTextPlugin.extract({
        fallback: { loader: 'style-loader' },
        use: 'css-loader',
      })
    ).toEqual([
      { loader, options: { omit: 1, remove: true } },
      { loader: 'style-loader' },
      { loader: 'css-loader' },
    ]);
  });

  it('accepts an array of fallback objects', () => {
    expect(
      ExtractTextPlugin.extract({
        fallback: [{ loader: 'something-loader' }, { loader: 'style-loader' }],
        use: 'css-loader',
      })
    ).toEqual([
      { loader, options: { omit: 2, remove: true } },
      { loader: 'something-loader' },
      { loader: 'style-loader' },
      { loader: 'css-loader' },
    ]);
  });
});
