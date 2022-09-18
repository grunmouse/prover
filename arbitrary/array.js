
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const {integer} = require('./primitive.js');

/**
 * Массив заданной длины
 */
const SizedArrayArb = ArbitraryBase.extend(
	{
		init:function(size, type){
			if(type.call){
				type = type();
			}
			this._size = size;
			this._type = type;
			if(type.size){
				let count = convert.countWithZero(BigInt(size), type.size);
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}
		},

		_convert: function(value){
			const size = this._size, type = this._type;
			
			if(!type.size){
				throw new Error('Array item type not has size of random');
			}
			
			let arr = convert.decomp(value, type.size);//.map(type.proxy('convert'));
			arr = Array.from({length:Number(size)}, (_, i)=>(type.convert(arr[i]||0)));
			return arr;
		}/*,
		
		_generate: function(){
			const size = this._size, type = this._type;
			let arr = Array.from({length:Number(size)}, type.proxy('generate'));
			return arr;
		}*/
	}
);

/**
 * Массив длиной не больше заданной (возможно - пустой)
 */
const LimitedArrayArb = ArbitraryBase.extend(
	{
		init:function(size, type){
			if(type.call){
				type = type();
			}
			this._size = size;
			this._type = type;

			if(type.size){
				let count = convert.countWithoutZero(BigInt(size), type.size);
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}

		},

		_convert: function(value){
			const size = this._size, type = this._type;
			
			if(!type.size){
				throw new Error('Array type not has size of random');
			}
			
			let arr = convert.decomp(value, type.size);
			arr = convert.withoutZero(arr, type.size); //Преобразование в безнулевую систему счисления, с усечением нулевого хвоста
			
			arr = arr.map((x)=>(type.convert(x-1n)));
			
			return arr;
		}/*,
		
		_generate: function(){
			let size = this.Class.pregen(BigInt(this._size))();
			let type = this._type;
			
			let arr = Array.from({length:Number(size)}, type.proxy('generate'));
			return arr;
		}*/
		
		
	}
);

const ArrayArb = ArbitraryBase.extend(
	{
		newInstance:function(range, type){
			if(!type){
				type = range;
				range = integer;
			}
			if(range.call){
				range = range();
			}
			if(typeof range === 'bigint'){
				range = Number(range);
			}
			if(typeof range === 'number'){
				return new SizedArrayArb(range, type);
			}
			if(range.length){
				let {min, max} = range;
				if(min === 0n){
					return new LimitedArrayArb(max, type);
				}
				else if(min === max){
					return new SizedArrayArb(max, type);
				}
				range = {min, max}; 
			}
			return this._super(range, type);
		}
	},
	{	
		init:function(range, type){
			if(type.call){
				type = type();
			}
			const {min, max} = range;
			this._minsize = min;
			this._maxsize = max;
			this._type = type;
			
			this._sizedPart = new SizedArrayArb(min, type);
			this._limitedPart = new LimitedArrayArb(max - min, type);

			if(type.size){
				if(typeof this._limitedPart.size === 'undefined'){
					console.log(min, max);
				}
				let count = this._sizedPart.size * this._limitedPart.size;
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}

		},

		_convert: function(value){
			if(!this._type.size){
				throw new Error('Array type not has size of random');
			}
			
			const sizedPart = this._sizedPart, limitedPart = this._limitedPart;
			
			const forSized = value % sizedPart.size;
			const forLimited = value / sizedPart.size;
			
			let arr = sizedPart.convert(forSized).concat(limitedPart.convert(forLimited));
			
			return arr;
		}/*,
		
		_generate: function(){
			let arr = this._sizedPart.generate().concat(this._limitedPart.generate());
			return arr;
		}*/
		
		
	}
);


module.exports = {
	sarray:SizedArrayArb,
	larray:LimitedArrayArb,
	array:ArrayArb
};