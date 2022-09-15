
const ArbitraryBase = require('./arbitrary-base.js');

const StringArb = ArbitraryBase.extend(
	{
		/**
		 * @param arb : TupleArb|ArrayArb - генератор массива (возможно многоуровневого) кодовых точек
		 */
		init:function(arb){
			if(arb.call){
				arb = arb();
			}
			this._arb = arb;
			if(arb.count){
				this._super(arb.limit);
			}
			else{
				this._super();
			}
		},

		_convert: function(value){
			return this._arb.convert(value);
		},
		
		_generate: function(){
			return this._arb.generate();
		}
		
		_finalConvert: function(value){
			value = value.flat(Infinity);
			return String.fromCodePoint(...value);
		}
	}
);

module.exports = StringArb;