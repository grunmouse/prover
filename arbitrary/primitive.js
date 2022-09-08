
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const IntegerArb = ArbitraryBase.extend(
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this._super({limit:max - min});

			this.convert = convert.offsetInt(min);
		}
	}
);

const BigIntegerArb = ArbitraryBase.extend(
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this._super({limit:max - min});
			
			this.convert = convert.offsetBigInt(min);
		}
	}
);

const BooleanArb = ArbitraryBase.extend(
	{
		init:function(){
			this._super({limit:1});
		},
		
		convert:function(value){
			return !!value;
		}
	}
);

const ElementArb = ArbitraryBase.extend(
	{
		init:function(arr){
			this._elements = arr;
			let limit = arr.length-1;
			this._super({limit});
		},
		
		convert:function(value){
			return this._elements[value];
		}
	}
);

const SimpleFloatArbBase = ArbitraryBase.extend(
	{
		extend:function(opendown, openup){
			const toFloat = convert.uint32ToFloat(opendown, openup);
			
			return this._super(
				{}, 
				{
					toFloat: toFloat
				}
			);
		}
	},
	
	{
		init:function(min, max){
			this._super({limit:0xFFFFFFFFn});
			this._min = min;
			this._max = max;
			this.expandFloat = convert.expandFloat(min, max);
		},
		
		convert:function(value){
			const f = this.toFloat(value);
			return this.expandFloat(f);
		}
	}
);

const I_I = SimpleFloatArbBase.extend(true, true);
const I_O = SimpleFloatArbBase.extend(true, false);
const O_O = SimpleFloatArbBase.extend(false, false);
const O_I = SimpleFloatArbBase.extend(false, true);


const bool = new BooleanArb();

const ints = {};
[8, 16, 32].forEach((size)=>{
	let full = 2**size;
	ints['uint' + size] = new IntegerArb(0, full-1);
	let half = full/2;
	ints['int' + size] = new IntegerArb(-half, half-1);
});

const bigints = {};

[32n, 64n, 128n].forEach((size)=>{
	let full = 2n**size;
	bigints['biguint' + size] = new BigIntegerArb(0n, full-1n);
	let half = full/2n;
	bigints['bigint' + size] = new BigIntegerArb(-half, half-1n);
});


module.exports = {
	bool,
	elements,
	integer:IntegerArb,
	bigint:BigIntegerArb,
	
	i_i:I_I,
	i_o:I_O,
	o_i:O_I,
	o_o:O_O,
	
	...ints,
	...bigints
};