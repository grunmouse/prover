const ArbitraryBase = require('./arbitrary-base.js');

const BooleanArb = ArbitraryBase.extend(
	'BooleanArbitrary',
	{
		init:function(){
			this._super(1);
		},
		
		_convert:function(value){
			return !!value;
		}
	}
);

module.exports = BooleanArb;