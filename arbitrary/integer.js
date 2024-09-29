const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const IntegerArb = ArbitraryBase.extend(
	{defaultConfig:[]},
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this.min = min;
			this.max = max;
			this._super(max - min);

			this._convert = convert.offsetInt(min);
		},
		
		resize: function(fun){
			let [min, max] = fun(this.min, this.max);
			
			return new IntegrArb(min, max);
		}
	}
);

const NatArb = IntegerArb.extend(
	{
		setup:function(max){
			return [0, max || MASK32];
		}
	}
);

const PositArb = IntegerArb.extend(
	{
		setup:function(max){
			return [1, max || MASK32];
		}
	}
);

const ints = {};
[8, 16, 32].forEach((size)=>{
	let full = 2**size;
	ints['uint' + size] = new IntegerArb(0, full-1);
	let half = full/2;
	ints['int' + size] = new IntegerArb(-half, half-1);
});



module.exports = {
	IntegerArb,
	integer:IntegerArb,
	nat:NatArb,
	posit:PositArb,
	
	...ints
};