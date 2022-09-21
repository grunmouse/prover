const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');


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


module.exports = {
	
	'float':I_O,
	i_i:I_I,
	i_o:I_O,
	o_i:O_I,
	o_o:O_O
};