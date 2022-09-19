
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const UnionArb = ArbitraryBase.extend(
	{
		init:function(arbs){
			arbs = arbs.map((a)=>(a.call ? a() : a));
			this._fields = arbs;
			if(arbs.every(a=>(a.size))){
				let count = arbs.reduce((akk, a)=>(akk+a.size), 0n);
				this._super(count-1n);
			}
			else{
				this._super();
			}			
		},

		_convert: function(value){
			let arbs = this._fields, len = arbs.length;
			for(let i=0; i<=len; ++i){
				let arb = arbs[i];
				if(value > arb.limit){
					value -= arb.size;
				}
				else{
					return arb.convert(value);
				}
			}
			throw new Error('Неправильно посчитано количество данных в Union');
		}
		
	}
);


module.exports = UnionArb ;