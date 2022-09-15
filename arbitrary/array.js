
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const {integer} = require('./privitive.js');

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
			if(type.count){
				let count = convert.countWithZero(size, type.count);
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}
		},

		_convert: function(value){
			const size = this._size, type = this._type;
			
			if(!type.count){
				throw new Error('Array type not has count of random');
			}
			
			let arr = convert.decomp(value, type.count).map(type.proxy('convert'));
			return arr;
		}
		
		_generate: function(){
			const size = this._size, type = this._type;
			let arr = Array.from({length:size}, type.proxy('generate'));
			return arr;
		}
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

			if(type.count){
				let count = convert.countWithoutZero(size, type.count);
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}

		},

		_convert: function(value){
			const size = this._size, type = this._type;
			
			if(!type.count){
				throw new Error('Array type not has count of random');
			}
			
			let arr = convert.decomp(value, type.count);
			arr = withoutZero(arr, type.count); //Преобразование в безнулевую систему счисления, с усечением нулевого хвоста
			
			arr = arr.map((x)=>(type.convert(x-1)));
			
			return arr;
		},
		
		_generate: function(){
			let size = this.Class.pregen(this._size)();
			let type = this._type;
			
			let arr = Array.from({length:size}, type.proxy('generate'));
			return arr;
		}
		
		
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
				let [min, max] = range;
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
			
			this._sizedPart = new SizedArrayArb(minsize, type);
			this._limitedPart = new LimitedArrayArb(maxsize - minsize, type);

			if(type.count){
				let count = this._sizedPart.count * this._limitedPart.count;
				let limit = count - 1n;
				this._super(limit);
			}
			else{
				this._super();
			}

		},

		_convert: function(value){
			if(!this._type.count){
				throw new Error('Array type not has count of random');
			}
			
			const sizedPart = this._sizedPart, limitedPart = this_limitedPart;
			
			const forSized = value % sizedPart.count;
			const forLimited = value / sizedPart.count;
			
			let arr = sizedPart.convert(forSized).concat(limitedPart.convert(forLimited));
			
			return arr;
		},
		
		_generate: function(){
			let arr = this._sizedPart.generate().concat(this._limitedPart.generate());
			return arr;
		}
		
		
	}
);


module.exports = {
	sarray:SizedArrayArb,
	larray:LimitedArrayArb,
	array:ArrayArb
};