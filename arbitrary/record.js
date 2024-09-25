
const ArbitraryBase = require('./arbitrary-base.js');

const RecordArb = ArbitraryBase.extend(
	{notDefault:true},
	{
		init:function(fields){
			this._fields = Object.entries(fields);
		},

		
		_generate: function(randomBigUintLim){
			let fields = this._fields.map(([key, arb])=>([key, arb.generate(randomBigUintLim)]));
		
			return Object.fromEntries(fields);
		}
	}
);


module.exports = RecordArb;