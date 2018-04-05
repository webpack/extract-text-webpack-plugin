require('./default-styles.css');
module.export = function (route) {
	return import(/* webpackChunkName: "route-[request]" */ './routes/' + route + 'index.js').then(function (route) {
		return route;
	});
};
