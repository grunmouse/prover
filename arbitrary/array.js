
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const ArrayArb = ArbitraryBase.extend(
	{
		init:function(size, type){
			if(type.call){
				type = type();
			}
			this._size = size;
			this._type = type;
			if(typeof size === 'number' && type.count){
				let count = BigInt(size) * type.count;
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}
		},

		convert: function(value){
			const size = this._size, type = this._type;
			
			if(typeof size !== 'number'){
				throw new Error('Array not has a specify size');
			}
			if(!type.count){
				throw new Error('Array type not has count of random');
			}
			
			let packer = convert.BigIntPacker(value);
			let arr = Array.from({length:size}, ()=>(type.convert(packer.pop(type.count))));
			return arr;
		},
		
		generate: function(){
			if(this.count){
				return this._super();
			}
			else{
				let len = this._size.generate();
				return Array.from({length:len}, ()=>(this._type.generate()));
			}
		}
	}
);