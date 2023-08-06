
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const {integer} = require('./privitive.js');
const union = require('./union.js');

function nodeArb(deep, tail, nodeFactory){
	if(deep === 0){
		return tail;
	}
	else{
		let arb = nodeArb(deep-1, tail, nodeFactory);
		return nodeFactory(arb);
	}
}

function tileNodeArb(deep, tail, nodeFactory){
	if(deep === 0){
		return tail;
	}
	else{
		let arb = nodeArb(deep-1, tail, nodeFactory);
		return nodeFactory(union([arb, tail]));
	}
}

const RecursiveArb = ArbitraryBase.extend(
	{
		newInstance(deep, tail, nodeFactory){
			if(deep.call){
				deep = deep();
			}
			if(typeof deep === 'bigint'){
				deep = Number(deep);
			}
			if(typeof deep === 'number'){
				return nodeArb(deep, tail, nodeFactory);
			}
			if(deep.length){
				let {min, max} = deep;
				if(min === 0n){
					return tileNodeArb(max, tail, nodeFactory);
				}
				else if(min === max){
					return new SizedArrayArb(max, type);
				}
				range = {min, max}; 
			}
			return this._super(range, type);
		}
	}
);