
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const ConstArb = ArbitraryBase.extend(
	'ConstArbitrary',
	{
		init:function(value){
			this._value = value;
			this._super(0);
		},

		
		_convert: function(value){
			if(value != 0n){
				throw new RangeError('Error convert to const');
			}
			return this._value;
		},
		
		_generate: function(){
			return this._value;
		}
	}
);


module.exports = ConstArb;