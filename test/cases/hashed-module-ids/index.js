require('./index.txt');

require.ensure([], () => {
  require('./a.js');
}, 'a-chunk');

require.ensure([], () => {
  require('./b.js');
}, 'b-chunk');
