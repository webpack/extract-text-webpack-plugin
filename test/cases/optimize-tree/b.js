require.ensure([], () => {
  require('./b.txt');
});

b = {};
