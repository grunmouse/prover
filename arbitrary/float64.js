const ArbitraryBase = require('./arbitrary-base.js');

const {float64} = require('@grunmouse/binary');
const convert = require('../convert/index.js');


const FloatArbitrary = ArbitraryBase.extend(
	'FloatArbitrary',
	{
		defaultConfig:[]
	},
	{
		setup:convert.ensureFloatArgs,
		
		opendown:false,
		openup:false,
		
		init:function(min, max){
			let minIndex = float64.getIndex(min);
			let maxIndex = float64.getIndex(max);
			
			if(this.opendown){
				minIndex++;
			}
			
			if(this.openup){
				maxIndex--;
			}
			
			this.minIndex = minIndex;
			this.maxIndex = maxIndex;
			
			this._super(maxIndex - minIndex);
		}
		
		_convert:function(raw){
			let index = raw - this.min;
			return float64.fromIndex(index);
		}
		
	}
);

const O_O = SimpleFloatArbBase.extend({opendown:true, openup:true}, {});
const O_I = SimpleFloatArbBase.extend({opendown:true}, {});
const I_I = SimpleFloatArbBase;
const I_O = SimpleFloatArbBase.extend({openup:true}, {});

const finite = O_O(Infinity, -Infinity);
const full = I_I(Infinity, -Infinity);

module.exports = {
	
	'float':I_O,
	i_i:I_I,
	i_o:I_O,
	o_i:O_I,
	o_o:O_O
};