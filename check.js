const random = require('@grunmouse/big-random');
const assert = require('assert');

const TupleArb = require('./arbitrary/tuple.js');

const InnerTuple = TupleArb.extend({});

function doThrow(fun, arg){
	try{
		fun(arg);
	}
	catch(e){
		return e;
	}
}

function check(arbitrary, property){
	/*
	 Здесь что-нибудь про инициализацию
	*/
	let count = 100;
	let firstValue, firstError;
	let rndState;
	
	for(let i=0; i<count; ++i){
		rndState = random.currentStateString();
		firstValue = arbitrary.generate();
		try{
			if(arbitrary instanceof InnerTuple){
				property(...firstValue);
			}
			else{
				property(firstValue);
			}
		}
		catch(e){
			firstError = e;
			break;
		}
	}
	
	if(!firstError){
		return {
			
		};
	}
	
	/*
	Приняв firstValue за корень
	находя дочерние элементы методом arbitrary.shrink(value)
	найти глубину поддерева, вызывающего ошибку, и соответствующий ей самый глубокий узел
	*/
	
	const gray = new Set(), black = new Set();
	const stack = [[firstValue,firstError,0]];
	let lastLevel = 0, lastValue = firstValue, lastError = firstError;
	while(stack.length){
		let [value, err, level] = stack[stack.length-1];
		if(black.has(value)){
			stack.pop();
		}
		else if(gray.has(value)){
			black.add(value);
			stack.pop();
		}
		else{
			gray.add(value);
			let items = arbitrary.shrink(value);
			if(!items || !items[Symbol.iterator]){
				continue;
			}
			for(let value of items){
				let err;
				try{
					if(arbitrary instanceof InnerTuple){
						property(...firstValue);
					}
					else{
						property(firstValue);
					}
				}
				catch(e){
					err = e;
					break;
				}
				if(err){
					stack.push([value, err, level+1]);
					if(level+1 > lastLevel){
						lastLevel = level+1;
						lastValue = value;
						lastError = error;
					}
				}
			}			
		}
	}
	
	lastError.message = `Property failed with rndState:${random.currentStateString()}\n\t` + lastError.message;
	
	return {
		err:lastError,
		value:lastValue,
		rndState: rndState
	}
	
}

function property(name, ...args){
	const property = args.pop();
	const arbs = args;
	const arbitrary = arbs.length>1 ? new InnerTuple(arbs) : arbs[0];
	if(!arbitrary){
		throw new Error('No arbitrary');
	}
	
	it(name, function(){
		let res = check(arbitrary, property);
		if(res && res.err){
			let test = this.test;
			/*
			что-нибудь про вывод в файл
			[test.file, test.fullTitle(), res.rndState, res.value, res.err]
			*/
			throw res.err;
		}
	});
}

module.exports = {
	check,
	property
};