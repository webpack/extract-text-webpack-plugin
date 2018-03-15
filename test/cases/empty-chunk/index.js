require('./a.txt');

require.ensure(
  [],
  () => {
    require('./a.js');
  },
  'async-chunk-a',
);
require.ensure(
  [],
  () => {
    require('./b.js');
  },
  'async-chunk-b',
);
