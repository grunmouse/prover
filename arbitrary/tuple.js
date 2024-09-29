
const ArbitraryBase = require('./arbitrary-base.js');
const {BigIntPacker} = require('../convert/index.js');

const TupleArb = ArbitraryBase.extend(
	'TupleArbitrary',
{
		init:function(arbs){
			arbs = arbs.map((a)=>(a.call ? a() : a));
			this._fields = arbs;
			if(arbs.every(a=>(a.size))){
				let count = arbs.reduce((akk, a)=>(akk*a.size), 1n);
				this._super(count-1n);
			}
			else{
				this._super();
			}
		},
		
		_convert: function(value){
			const pack = new BigIntPacker(value);
			
			let arr = this._fields.map((arb)=>{
				let val = pack.pop(arb.size);
				return arb.convert(val);
			});
			
			return arr;
		},
		
		_generate: function(randomBigUintLim){
			if(this.pregen){
				return this._super(randomBigUintLim);
			}
			else{
				return this._fields.map((arb)=>(arb.generate(randomBigUintLim)));
			}
		}
	}
);


module.exports = TupleArb;