
module.exports = {
	ArbitraryBase:require('./arbitrary-base.js'),
	ConvertBase:require('./convert-base-arb.js'),
	...require('./array.js'),
	...require('./primitive.js'),
	...require('./char.js'),
	...require('./strings.js'),
	dict:require('./dict.js'),
	record:require('./record.js'),
	tuple:require('./tuple.js'),
	union:require('./union.js'),
	uarray:require('./unique-array.js'),
	merge:require('./merge-dict.js')
};