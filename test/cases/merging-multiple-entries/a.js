require.ensure([], () => {
  require('./a.txt');
  require('./b.txt');
});
