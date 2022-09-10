
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const UnionArb = ArbitraryBase.extend(
	{
		init:function(arbs){
			this._fields = arbs;
		},

		
		generate: function(){
			let index = this.Class.pregen(this._fields.length -1)();
			let item = this._fields[index];
			return item.generate();
		}
	}
);


module.exports = TupleArb;