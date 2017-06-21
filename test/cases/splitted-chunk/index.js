require('./a.txt');
require.ensure([], () => {
  require('./b.txt');
});
