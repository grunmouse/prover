
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const UnionArb = ArbitraryBase.extend(
	{
		init:function(arbs){
			this._fields = arbs;
			if(arbs.every(a=>(a.count))){
				let count = arbs.reduce((akk, a)=>(akk+a), 0n);
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
					value -= arb.count;
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