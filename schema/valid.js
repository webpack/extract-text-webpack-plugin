var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});
var json = require('./schema.json');

module.exports = function validate(data) {
	var validSchema = ajv.compile(json);
	var valid = validSchema(data);

	if(!valid) {
		throw new Error("Your ExtractTextPlugin config is not correct. Please double check.");
	} else {
		console.log('your stuff works');
	}
}
