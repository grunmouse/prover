
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const TupleArb = ArbitraryBase.extend(
	{
		init:function(arbs){
			this._fields = arbs;
		},

		
		generate: function(){
			return this._fields.map((arb)=>(arb.generate()));
		}
	}
);


module.exports = TupleArb;