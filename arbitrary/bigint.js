const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');


const BigIntegerArb = ArbitraryBase.extend(
	'BigIntArbitrary',
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this.min = min;
			this.max = max;
			this._super(max - min);
			
			this._convert = convert.offsetBigInt(min);
		}
	}
);


const bigints = {};

[32n, 64n, 128n].forEach((size)=>{
	let full = 2n**size;
	bigints['biguint' + size] = new BigIntegerArb(0n, full-1n);
	let half = full/2n;
	bigints['bigint' + size] = new BigIntegerArb(-half, half-1n);
});


module.exports = {
	bigint:BigIntegerArb,
	
	...bigints
};