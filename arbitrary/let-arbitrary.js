const ArbitraryBase = require('./arbitrary-base.js');
const cnst = require('./constants.js');
const tuple = require('./tuple.js');

/**
 * Класс, описывающий конструкцию LET над генераторами
 */
const LetArbitrary = ArbitraryBase.extend(
	'LetArbitrary',
	{
		setup:function(vars, factory){
			this._super();
			if(!Array.isArray(vars)){
				vars = [vars];
			}
			this.vars = tuple(vars);
			this.factory = factory;
		},
		
		_generate(){
			let vals = vars.generate();
			let arb = this.factory(...vals);
			return arb.generate();
		}
	}
);

module.exports = LetArbitrary;