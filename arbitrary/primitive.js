const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const IntegerArb = ArbitraryBase.extend(
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

const BigIntegerArb = ArbitraryBase.extend(
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this._super(max - min);
			
			this._convert = convert.offsetBigInt(min);
		}
	}
);

const BooleanArb = ArbitraryBase.extend(
	{
		init:function(){
			this._super(1);
		},
		
		_convert:function(value){
			return !!value;
		}
	}
);

const ElementArb = ArbitraryBase.extend(
	{
		init:function(arr){
			this._elements = arr;
			let limit = arr.length-1;
			this._super(limit);
		},
		
		_convert:function(value){
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
			[min, max] = convert.ensureFloatArgs(min, max);
			this._super(0xFFFFFFFFn);
			this._min = min;
			this._max = max;
			this.expandFloat = convert.expandFloat(min, max);
		},
		
		_convert:function(value){
			const f = this.toFloat(value);
			return this.expandFloat(f);
		}
	}
);

const O_O = SimpleFloatArbBase.extend(true, true);
const O_I = SimpleFloatArbBase.extend(true, false);
const I_I = SimpleFloatArbBase.extend(false, false);
const I_O = SimpleFloatArbBase.extend(false, true);


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
	elements:ElementArb,
	integer:IntegerArb,
	bigint:BigIntegerArb,
	nat:NatArb,
	posit:PositArb,
	
	'float':I_O,
	i_i:I_I,
	i_o:I_O,
	o_i:O_I,
	o_o:O_O,
	
	...ints,
	...bigints
};