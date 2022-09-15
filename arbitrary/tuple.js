
const ArbitraryBase = require('./arbitrary-base.js');
const {BigIntPacker} = require('./convert/index.js');

const TupleArb = ArbitraryBase.extend(
	{
		init:function(arbs){
			this._fields = arbs;
			if(arbs.every(a=>(a.count))){
				let count = arbs.reduce((akk, a)=>(akk*a), 1n);
				this._super(count-1n);
			}
			else{
				this._super();
			}
		},
		
		_convert: function(value){
			const pack = new BigIntPacker(value);
			
			let arr = this._fields.map((arb)=>{
				let val = pack.pop(arb.count);
				return arb.convert(val);
			});
			
			return arr;
		},
		
		_generate: function(){
			return this._fields.map((arb)=>(arb.generate()));
		}
	}
);


module.exports = TupleArb;