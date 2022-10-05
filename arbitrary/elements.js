const ArbitraryBase = require('./arbitrary-base.js');

/**
 * Случайный выбор одного из элементов массива
 */

const ElementArb = ArbitraryBase.extend(
	'ElementsArbitrary',
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

module.exports = ElementArb;