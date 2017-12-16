import ExtractTextPlugin from '../src';

const loader = require.resolve('../src/loader');

describe('specifying loader', () => {
  it('accepts a loader string', () => {
    expect(ExtractTextPlugin.extract('css-loader')).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader' },
    ]);
  });

  it('accepts a chained loader string', () => {
    expect(
      ExtractTextPlugin.extract('css-loader!postcss-loader!sass-loader')
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' },
    ]);
  });

  it('accepts an array of loader names', () => {
    expect(
      ExtractTextPlugin.extract(['css-loader', 'postcss-loader', 'sass-loader'])
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' },
    ]);
  });

  it('accepts a loader object', () => {
    expect(ExtractTextPlugin.extract({ use: 'css-loader' })).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader' },
    ]);
  });

  it('accepts an array of loader names in loader object', () => {
    expect(
      ExtractTextPlugin.extract({
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
      })
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' },
    ]);
  });

  it('accepts a loader object with an options object', () => {
    expect(
      ExtractTextPlugin.extract({
        use: 'css-loader',
        options: { modules: true },
      })
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { use: 'css-loader', options: { modules: true } },
    ]);
  });

  it('accepts a loader object with an options object in array of loaders', () => {
    expect(
      ExtractTextPlugin.extract({
        use: [
          { loader: 'css-loader', options: { modules: true } },
          'postcss-loader',
        ],
      })
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader', options: { modules: true } },
      { loader: 'postcss-loader' },
    ]);
  });

  it('accepts a loader object with a (legacy) query object', () => {
    expect(
      ExtractTextPlugin.extract({ use: 'css-loader', query: { modules: true } })
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { use: 'css-loader', query: { modules: true } },
    ]);
  });

  it('accepts a loader object with a legacy loader field', () => {
    expect(
      ExtractTextPlugin.extract({
        loader: 'css-loader',
        query: { modules: true },
      })
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader', query: { modules: true } },
    ]);
  });

  it('accepts an array of loader objects', () => {
    expect(
      ExtractTextPlugin.extract([
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
        { loader: 'sass-loader' },
      ])
    ).toEqual([
      { loader, options: { omit: 0, remove: true } },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' },
    ]);
  });
});
