
const ArbitraryBase = require('./arbitrary-base.js');
const ConvertBase = require('./convert-base-arb.js');

/**
 * Оборачивает кортеж записей или словарей, сливает поля результата в один объект
 */
 
const MergeDict = ConvertBase.extend(
	{
		_finalConvert: function(value){
			let result = {};
			Object.assign(result, ...value);
			
			return result;
		}
	}
);

module.exports = StringArb;