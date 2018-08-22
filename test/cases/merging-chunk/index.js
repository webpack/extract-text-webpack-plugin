require('./a.txt');
require.ensure([], () => {
  require('./b.txt');
  require('./c.txt');
});
