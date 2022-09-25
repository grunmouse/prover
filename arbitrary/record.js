
const ArbitraryBase = require('./arbitrary-base.js');

const RecordArb = ArbitraryBase.extend(
	{
		init:function(fields){
			this._fields = Object.entries(fields);
		},

		
		_generate: function(){
			let fields = this._fields.map(([key, arb])=>([key, arb.generate()]));
		
			return Object.fromEntries(fields);
		}
	}
);


module.exports = RecordArb;