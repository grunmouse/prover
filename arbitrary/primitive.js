

const BooleanArb = require('./boolean.js');
const bool = new BooleanArb();

const cnst = require('./constants.js');


module.exports = {
	bool,
	cnst,
	constants:cnst,
	'const':cnst,
	elements:require('./elements.js'),
	...require('./integer.js'),
	...require('./bigint.js'),
	...require('./float.js')
};