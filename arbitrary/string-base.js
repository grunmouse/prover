
const ArbitraryBase = require('./arbitrary-base.js');
const ConvertBase = require('./convert-base-arb.js');

const StringArb = ConvertBase.extend(
	{
		_finalConvert: function(value){
			value = value.flat(Infinity);
			return String.fromCodePoint(...value);
		}
	}
);

module.exports = StringArb;