
const ArbitraryBase = require('./arbitrary-base.js');
const uarray = require('./unique-array.js');


const DictArb = ArbitraryBase.extend(
	'DictArbitrary',
	{
		init:function(size, keys, type){
			this._size = size;
			this._keys = keys;
			this._type = type;
			this._super();
		},

		
		_generate: function(randomBigUintLim){
			let keys = uarray(this._size, this._keys).generate(randomBigUintLim)
			
			let fields = keys.map((key)=>([key, this._type.generate(randomBigUintLim)]));
			
			return Object.fromEntries(fields);
		}
	}
);


module.exports = DictArb;