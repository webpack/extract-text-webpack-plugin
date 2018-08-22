require.ensure([], () => {
  require('./a.txt');
  require('./c.txt');
});
