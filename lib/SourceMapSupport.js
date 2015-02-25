function applyToLoaders(loaders) {
	return loaders.map(function(loader){
		if (loader.indexOf('?') !== -1) {
			return loader;
		}

		return loader.replace(/css(-loader)?/, '$&?sourceMap');
	});
}

function splitAndApplyToLoader(loader) {
	var loaders = loader.split('!');
	return applyToLoaders(loaders).join('!');
}

module.exports = {
	applyParam: function(loaders) {
		return loaders.map(function(loader){
			if (loader.loader) {
				loader.loader = splitAndApplyToLoader(loader.loader);
			} else {
				loader.loaders = applyToLoaders(loader.loaders);
			}
			return loader;
		});
	}
};
