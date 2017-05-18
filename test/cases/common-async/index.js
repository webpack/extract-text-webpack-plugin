require.ensure(
	[],
	function() {
		require("./a.js");
	},
	'async-chunk-a'
);
require.ensure(
	[],
	function() {
		require("./b.js");
	},
	'async-chunk-b'
);
