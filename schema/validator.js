var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});
var json = require('./schema.json');

module.exports = function validate(data) {
	var ajv = new Ajv();
	var isValid = ajv.validate(json, data);

	if(!isValid) {
		throw new Error(ajv.errorsText());
	}
}
