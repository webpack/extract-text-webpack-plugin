require("./index.txt");

require.ensure([], function() {
	require("./a.js");
}, 'a-chunk');

require.ensure([], function() {
	require("./b.js");
}, 'b-chunk');
