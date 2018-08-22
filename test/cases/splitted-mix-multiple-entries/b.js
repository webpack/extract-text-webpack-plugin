
require('./b.txt');
require.ensure([], (require) => {
  require('./c.js');
});