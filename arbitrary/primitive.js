

const BooleanArb = require('./boolean.js');
const bool = new BooleanArb();

module.exports = {
	bool,
	elements:require('./elements.js'),
	...require('./integer.js'),
	...require('./bigint.js'),
	...require('./float.js')
};