
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const ConstArb = ArbitraryBase.extend(
	{
		init:function(value){
			this._value = value;
			this._super(0);
		},

		
		generate: function(){
			return this._value;
		}
	}
);


module.exports = ConstArb;