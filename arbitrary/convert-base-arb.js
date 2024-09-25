
const ArbitraryBase = require('./arbitrary-base.js');

/**
 * База обёртка
 * Чтобы использовать, надо определить _finalConvert
 */
const ConvertBaseArb = ArbitraryBase.extend(
	{notDefault:true},
	{
		/**
		 * @param arb : TupleArb|ArrayArb - генератор массива (возможно многоуровневого) кодовых точек
		 */
		init:function(arb){
			if(arb.call){
				arb = arb();
			}
			this._arb = arb;
			if(arb.size){
				this._super(arb.limit);
			}
			else{
				this._super();
			}
		},
		
		_convert: function(value){
			return this._arb.convert(value);
		},
		
		_generate: function(randomBigUintLim){
			return this._arb.generate(randomBigUintLim);
		}
	}
);

module.exports = ConvertBaseArb;