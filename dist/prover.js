/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 594:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


function makeMaskUint8(val){
	if(val >= 16){
		if(val >= 64){
			if(val >= 128){
				return 255;
			}
			else{
				return 127;
			}
		}
		else{
			if(val >= 32){
				return 63;
			}
			else{
				return 31;
			}
		}
	}
	else{
		if(val >= 4){
			if(val >= 8){
				return 15;
			}
			else{
				return 7;
			}
		}
		else{
			if(val >= 2){
				return 3;
			}
			else{
				return 1;
			}
		}
	}
}

function makeMaskUint32(val){
	if(val>=65536){
		if(val>=16777216){
			return (makeMaskUint8(val>>24)<<24) | 16777215;
		}
		else{
			return (makeMaskUint8(val>>16)<<16) | 65535;
		}
	}
	else{
		if(val>=256){
			return (makeMaskUint8(val>>8)<<8) | 255;
		}
		else{
			return makeMaskUint8(val);
		}
	}
}

const bigint = __webpack_require__(723);

/*
Абстрактный класс, содержащий общие функции и требующий метод randomByte, который должен быть определён в наследниках
 */
class AbstractRandom {
	
	randomUInt32(){
		const [a, b, c, d] = Array.from({length:4}, ()=>this.randomByte());
		
		return (((((a<<8) | b)<<8) | c)<<8)|d;
	}

	randomByteLim(max){
		if(max === 0){
			return 0; //Это число выбрано совершенно случайно на отрезке [0,0]
		}
		let mask = makeMaskUint8(max);
		while(true){
			let val = (this.randomByte() & mask);
			if(val<=max){
				return val;
			}
		}
	}

	randomUint32Lim(max){
		if(max === 0){
			return 0; //Это число выбрано совершенно случайно на отрезке [0,0]
		}
		let mask = makeMaskUint32(max);
		while(true){
			let val = (this.randomUInt32() & mask);
			if(val<=max){
				return val;
			}
		}
	}
	
	randomBigUint(size){
		const buffer = new ArrayBuffer(size);
		
		const dv = new DataView(buffer);
		
		for(let offset = size; offset--; ){
			let val = this.randomByte();
			dv.setUint8(offset, val);
		}
		
		const result = bigint.fromBuffer(buffer);
		
		return result;
	}

	randomBigUintLim(lim){
		if(lim === 0n){
			return 0n; //Это число выбрано совершенно случайно на отрезке [0,0]
		}
		const limBuffer = bigint.toBuffer(lim);
		const len = limBuffer.byteLength;
		const buffer = new ArrayBuffer(len);
		
		const dvLim = new DataView(limBuffer);
		const dv = new DataView(buffer);
		
		let accept = false;
		while(!accept){
			let first = true;
			for(let offset = len; offset--; ){
				if(accept){
					let val = this.randomByte();
					dv.setUint8(offset, val);
				}
				else{
					let limit = dvLim.getUint8(offset);
					let val;
					
					if(first){
						//До появления старшего значимого байта limit
						if(limit>0){
							//Старший значимый байт появился
							val = this.randomByte() & makeMaskUint8(limit);
							first = false;
						}
						else{
							val = 0;
						}
					}
					else{
						val = this.randomByte();
					}
					
					if(val>limit){
						break; //Перезапуск генерации числа
					}
					else{
						dv.setUint8(offset, val);
						
						accept = (val < limit || offset ===0);
					}
				}
			}
		}
		
		const result = bigint.fromBuffer(buffer);
		
		return result;
	}	
}

module.exports = AbstractRandom;

/***/ }),

/***/ 723:
/***/ ((module) => {

/**
 * LE
 */
function fromBuffer(buffer){
	const len = buffer.byteLength;
	const dv = new DataView(buffer);
	
	let val = 0n;
	for(let offset = (len-1); offset >=0; --offset){
		val = (val<<8n) | BigInt(dv.getUint8(offset));
	}
	
	return val;
}

/**
 * LE
 */
function toBuffer(value, size){
	let arr = [];
	const mask = 0xFFn;
	
	for(let i=0; value; ++i){
		arr[i] = value & mask;
		value = value >> 8n;
	}
	
	size = size || arr.length;

	const buffer = new ArrayBuffer(size);
	const dv = new DataView(buffer);
	arr.forEach((value, i)=>{
		dv.setUint8(i, Number(value));
	});
	
	return buffer;
}

module.exports = {
	fromBuffer,
	toBuffer
}

/***/ }),

/***/ 468:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = {
	AbstractRandom: __webpack_require__(594),
	...__webpack_require__(369),
	...__webpack_require__(417)
}

/***/ }),

/***/ 417:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const rc4 = new ((__webpack_require__(369).RC4small));

const currentStateString = rc4.currentStateString.bind(rc4);
const setStateString = rc4.setStateString.bind(rc4);
const randomByte = rc4.randomByte.bind(rc4);
const randomUInt32 = rc4.randomUInt32.bind(rc4);
const randomByteLim    = rc4.randomByteLim.bind(rc4);
const randomUint32Lim  = rc4.randomUint32Lim.bind(rc4);
const randomBigUint    = rc4.randomBigUint.bind(rc4);
const randomBigUintLim = rc4.randomBigUintLim.bind(rc4);
	
module.exports = {
	currentStateString,
	setStateString,
	randomByte,
	randomUInt32,
	randomByteLim,
	randomUint32Lim,
	randomBigUint,
	randomBigUintLim
};

/***/ }),

/***/ 369:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const AbstractRandom = __webpack_require__(594);

// Based on RC4 algorithm, as described in
// http://en.wikipedia.org/wiki/RC4

/**
 * Меняет местами элементы массива
 */
  function swap(s, i, j){
      var tmp = s[i];
      s[i] = s[j];
      s[j] = tmp;
  }

class AbstractRC4 extends AbstractRandom{
	constructor(){
		super();
		const N = this.N;
		let s = Array.from({length:N}, (x, i)=>(i)); //Тождественная перестановка

		//Просто перемешиваю массив
		for (let i = 0; i < N; i++) {
			let j = i + Math.floor(Math.random()*(N-i));
			swap(s, i, j);
		}		
		
		this.i = 0;
		this.j = 0;
		this.s = s;
		
	}
	
	currentState(){
		const {i, j, s} = this;
		return {i, j, s:s.slice(0)};
	}
	
	setState(state){
		const {i, j, s} = state;
		
		
		this.i = i;
		this.j = j;
		this.s = s.slice(0);
	}
	
	randomNative() {
		let {i, j, s, N} = this;
	  
		i = (i + 1) % N; 
		j = (j + s[i]) % N; 

		swap(s, i, j);

		let k = s[(s[i] + s[j]) % N];

		this.i = i;
		this.j = j;
	
		return k;
	}
	
}

class RC4 extends AbstractRC4{
	
	randomByte(){
		return this.randomNative();
	}
}

RC4.prototype.N = 256;

class RC4small extends AbstractRC4{
	
	randomByte(){
		var a = this.randomNative();
		var b = this.randomNative();

		return (a << 4) | b;
	}
	
	currentStateString() {
		var {i, j, s} = this.currentState();

		var res = [i,j].concat(s).map(x=>x.toString(16)).join("");
		return res;
	};

	setStateString(stateString) {
		if (!stateString.match(/^[0-9a-f]{18}$/)) {
			throw new TypeError("RC4small stateString should be 18 hex character string");
		}
		
		var [i, j, ...s] = stateString.split("").map((x)=>parseInt(x, 16));

		this.setState({i, j, s});
	}
	
}

RC4small.prototype.N = 16;

module.exports = {
	RC4,
	RC4small
};


/***/ }),

/***/ 550:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Class = __webpack_require__(120);

/*
 * Функция генерации случайного целого, последовательно каррирующая аргументы слева.
 * @param maxLimit : BigInt - верхний предел генерируемого значения (включая)
 * @param randomLim : Function(BigInt) => BigInt - функция генерации случайного числа от нуля до аргумента (включая)
 * @param minLimit : BigInt=0n - нижний предел генерируемого значения
 */
const pregen = (maxLimit)=>(randomLim)=>(minLimit=0n)=>(randomLim(maxLimit-minLimit)+minLimit);

/*
 * @interface IArbitrary<T>
 * @typeparam T - тип генерируемых случайных значений
 *
 * @property limit : BigInt - наибольший индекс возвращаемого значения
 *
 * @property size : BigInt - размер генерируемых случайных данных
 * size = limit + 1n
 *
 * @method generate(randomBigUintLim) - генератор случайного значения
 * @param randomBigUintLim : Function(BigUInt=>UBigInt) - генератор случайных значений не больше аргумента
 * @return T
 *
 * @method convert(index) - преобразует переданное число в значение заданного типа
 * @param index : BigInt & [0..limit]
 * @return T
 *
 * @method shrink(value) ??? - генерирует для заданного значения множество соседних значений, в направлении поиска ошибки
 * @param value : T
 * @return null | Iterable<T> - множество соседних значений
 *
 * @method all() - генерирует все значения типа T
 * @yields T 
 
 * @method stringify(value) - преобразует значение в строку
 * @param value : T
 * @return String
 *
 */

const ArbitraryBase = Class.extend(
	{

		makePregen:pregen,
		
		_extend:function(name, klass, proto){

			if(proto.limit){
				let lim = BigInt(proto.limit);
				proto.limit = limit;
				proto.size = limit+1n;
				proto.pregen = this.makePregen(limit);
			}
			
			let cls = this._super(name, klass, proto);
			
			if(!cls.notDefault){
				let dflt = new cls();
				['generate', 'convert', 'shrink', 'all', 'stringify'].forEach((key)=>{
					cls[key] = dflt.proxy(key);
				});
				['limit', 'size'].forEach((key)=>{
					cls[key] = dflt[key];
				});
			}
			
			
			return cls;
		}
	}, 
	{
		/**
		 * Принимает предельное значение сырого случайного числа, создаёт прегенератор
		 */
		init:function(limit){
			if(limit != null){
				try{
					limit = BigInt(limit);
				}
				catch(e){
					console.log(limit);
					throw e;
				}
				this.limit = limit;
				this.size = limit+1n;
				this.pregen = this.Class.makePregen(limit);
			}
		},
		
		_generate:function(randomBigUintLim){
			let raw = this.pregen(randomBigUintLim)();
			return this._convert(raw);
		},
		
		generate:function(randomBigUintLim){
			return this._finalConvert(this._generate(randomBigUintLim));
		},
		
		convert:function(value){
			let raw = value.call ? value(this.limit) : value;
			return this._finalConvert(this._convert(raw));
		},
		
		all:function*(){
			if(this.limit == null){
				return;
			}
			
			for(let i=0n; i<this.size; i++){
				let c = this.convert(i);
				yield c;
			}
		},
		
		shrink:function(){
			return;
		},
		
		_convert:function(value){
			return value;
		},
		
		_finalConvert:function(value){
			return value;
		},
		
		stringify:function(value){
			return ''+value;
		}
	}
);

module.exports = ArbitraryBase;

/***/ }),

/***/ 461:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const convert = __webpack_require__(677);

const ArbitraryBase = __webpack_require__(550);

const {integer} = __webpack_require__(597);

/**
 * Массив заданной длины
 */
const SizedArrayArb = ArbitraryBase.extend(
	{notDefault:true},
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
		}
	}
);

/**
 * Массив длиной не больше заданной (возможно - пустой)
 */
const LimitedArrayArb = ArbitraryBase.extend(
	{notDefault:true},
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
		notDefault:true,
		
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
			if(range.size){
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

/***/ }),

/***/ 881:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = __webpack_require__(677);

const ArbitraryBase = __webpack_require__(550);


const BigIntegerArb = ArbitraryBase.extend(
	'BigIntArbitrary',
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this.min = min;
			this.max = max;
			this._super(max - min);
			
			this._convert = convert.offsetBigInt(min);
		}
	}
);


const bigints = {};

[32n, 64n, 128n].forEach((size)=>{
	let full = 2n**size;
	bigints['biguint' + size] = new BigIntegerArb(0n, full-1n);
	let half = full/2n;
	bigints['bigint' + size] = new BigIntegerArb(-half, half-1n);
});


module.exports = {
	bigint:BigIntegerArb,
	
	...bigints
};

/***/ }),

/***/ 576:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ArbitraryBase = __webpack_require__(550);

const BooleanArb = ArbitraryBase.extend(
	'BooleanArbitrary',
	{
		init:function(){
			this._super(1);
		},
		
		_convert:function(value){
			return !!value;
		}
	}
);

module.exports = BooleanArb;

/***/ }),

/***/ 322:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
	integer,
	uint8,
	uint16
} = __webpack_require__(597);

const cnst = __webpack_require__(985);
const union = __webpack_require__(351);

const octet = uint8;
const ascii = integer(32,0xFE);

const digit = integer(0x30, 0x39);

const latUp = integer(0x41, 0x5A);
const latLow = integer(0x61, 0x7A);

const rusUp = union([cnst(0x401), integer(0x410,0x42F)]);
const rusLow = union([integer(0x430, 0x44F), cnst(0x451)]);

const lat = union([latUp, latLow]);

const rus = union([rusUp, rusLow]);

const _ = cnst("_".codePointAt(0));
const $ = cnst("$".codePointAt(0));

const identLeader = union([latUp, latLow, _, $]);

const identBody = union([digit, latUp, latLow, _, $]);

module.exports = {
	octet,
	ascii,
	digit,
	lat,
	latUp,
	latLow,
	rus,
	rusUp,
	rusLow,
	identLeader,
	identBody
};

/***/ }),

/***/ 120:
/***/ ((module) => {

	// if we are initializing a new class
	var initializing = false,
        //point = '.',
		//noop = function(){},
		isFunction = (fun)=>(fun && fun.call),
		isArray = Array.isArray,
		extend = Object.assign,
        toStringStr = 'toString',
        valueOfStr = 'valueOf',

		// tests if we can get super in .toString()
		fnTest = /xyz/.test(function() {
			return 'xyz'; //Old one was fucked up by GCC
		}) ? /\b_super\b/ : /.*/;

	
	function ownKeys(newProps){
		if(!newProps){
			return [];
		}
		
		let keys = Object.keys(newProps);
		
		//Take care of toString method
		if(!keys.includes(toStringStr) && newProps.hasOwnProperty(toStringStr)){
			keys.push(toStringStr);
		}

		//Take care of valueOf method
		if(!keys.includes(valueOfStr) && newProps.hasOwnProperty(valueOfStr)){
			keys.push(valueOfStr);
		}
		
		return keys;
	}

	// overwrites an object with methods, sets up _super
	// newProps - new properties
	// oldProps - where the old properties might be
	// addTo - what we are adding to
	var inheritProps = function( newProps, oldProps, addTo ) {
		var wrapSuper = function( name, fn ) {
			return function() {
				var tmp = this._super,
						ret;

				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = oldProps[name];

				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				ret = fn.apply(this, arguments);
				this._super = tmp;
				return ret;
			};
		};
		
		
		for (let name of ownKeys(newProps) ) {
			// Check if we're overwriting an existing function
			addTo[name] = isFunction(newProps[name]) && 
						  isFunction(oldProps[name]) && 
						  fnTest.test(newProps[name]) ? wrapSuper(name, newProps[name]) : newProps[name];
		}

	};


	var clss = function AnonimousClass() {
		if (arguments.length) {
			clss.extend.apply(clss, arguments);
		}
	};

	/* @Static*/
	extend(clss, {
		proxy: function( funcs ) {

			//args that should be curried
			var args = Array.from(arguments),
				self;

			funcs = args.shift();

			if (!isArray(funcs) ) {
				funcs = [funcs];
			}

			self = this;
			//!steal-remove-start
			for( var i =0; i< funcs.length;i++ ) {
				if(typeof funcs[i] == "string" && !isFunction(this[funcs[i]])){
					throw ("does not have a "+funcs[i]+"method!");
				}
			}
			//!steal-remove-end
			return function class_cb(...a) {
				var cur = args.concat(a),
					isString, 
					length = funcs.length,
					f = 0,
					func;

				for (; f < length; f++ ) {
					func = funcs[f];
					if (!func ) {
						continue;
					}

					isString = typeof func == "string";
					if ( isString && self._set_called ) {
						self.called = func;
					}
					cur = (isString ? self[func] : func).apply(self, cur || []);
					if ( f < length - 1 ) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		},

		newInstance: function(...argumentsCopy) {
			var inst = this.rawInstance(),
				args;

			if ( inst.setup ) {
				args = inst.setup(...argumentsCopy);
			}
			
			if(!isArray(args)){
				args = argumentsCopy;
			}
			
			if ( inst.init ) {
				inst.init(...args);
			}

			return inst;
		},

		setup: function(...args) {
			return args;
		},
		rawInstance: function() {
			initializing = true;
			var inst = new this();
			Object.defineProperty(inst, '_super', {writable:true});
			initializing = false;
			return inst;
		},

		extend: function(name, klass, proto ) {
			if(typeof name !== 'string'){
				proto = klass;
				klass = name;
				name = this.name || 'AnonimousClass';
			}
			// figure out what was passed
			if (!proto ) {
				proto = klass;
				klass = undefined;
			}
			
			return this._extend(name, klass, proto);
		},
		
		_extend: function(name, klass, proto){
			proto = proto || {};
			var _super_class = this,
				_super = this.prototype,
				_prototype, parts, current;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			_prototype = new this();
			initializing = false;
			// Copy the properties over onto the new prototype
			inheritProps(proto, _super, _prototype);

			// The dummy class constructor

			function Class(...args) {
				// All construction is actually done in the init method
				if ( initializing ) return;

				if ( !(this && this.constructor === Class) ) { //we are being called w/o new
					return Class.newInstance(...args)
					//return arguments.callee.extend.apply(arguments.callee, arguments)
				} else { //we are being called w/ new
					return this.Class.newInstance(...args)
				}
			}
			Object.defineProperty(Class, 'name', {value:name});
			
			
			Object.setPrototypeOf(Class, this);
			
			// copy new props on class
			inheritProps(klass, this, Class);

			Class.prototype = _prototype;

			//make sure our prototype looks nice
			Class.prototype.Class = Class.prototype.constructor = Class;


			var args = Class.setup(_super_class, name, klass, proto) || [];

			if ( Class.init ) {
				Class.init(...args);
			}

			/* @Prototype*/
			return Class;
		}

	});





	clss.prototype.proxy = clss.proxy;

module.exports = clss;

/***/ }),

/***/ 985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const convert = __webpack_require__(677);

const ArbitraryBase = __webpack_require__(550);

const ConstArb = ArbitraryBase.extend(
	'ConstArbitrary',
	{
		init:function(value){
			this._value = value;
			this._super(0);
		},

		
		_convert: function(value){
			if(value != 0n){
				throw new RangeError('Error convert to const');
			}
			return this._value;
		},
		
		_generate: function(){
			return this._value;
		}
	}
);


module.exports = ConstArb;

/***/ }),

/***/ 923:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const ArbitraryBase = __webpack_require__(550);

/**
 * База обёртка
 * Чтобы использовать, надо определить _finalConvert
 */
const ConvertBaseArb = ArbitraryBase.extend(
	{notDefault:true},
	{
		/**
		 * @param arb : TupleArb|ArrayArb - генератор массива (возможно многоуровневого) кодовых точек
		 */
		init:function(arb){
			if(arb.call){
				arb = arb();
			}
			this._arb = arb;
			if(arb.size){
				this._super(arb.limit);
			}
			else{
				this._super();
			}
		},
		
		_convert: function(value){
			return this._arb.convert(value);
		},
		
		_generate: function(randomBigUintLim){
			return this._arb.generate(randomBigUintLim);
		}
	}
);

module.exports = ConvertBaseArb;

/***/ }),

/***/ 366:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const ArbitraryBase = __webpack_require__(550);
const uarray = __webpack_require__(729);


const DictArb = ArbitraryBase.extend(
	'DictArbitrary',
	{
		init:function(size, keys, type){
			this._size = size;
			this._keys = keys;
			this._type = type;
			this._super();
		},

		
		_generate: function(randomBigUintLim){
			let keys = uarray(this._size, this._keys).generate(randomBigUintLim)
			
			let fields = keys.map((key)=>([key, this._type.generate(randomBigUintLim)]));
			
			return Object.fromEntries(fields);
		}
	}
);


module.exports = DictArb;

/***/ }),

/***/ 863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ArbitraryBase = __webpack_require__(550);

/**
 * Случайный выбор одного из элементов массива
 */

const ElementArb = ArbitraryBase.extend(
	'ElementsArbitrary',
	{
		notDefault:true
	},
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

/***/ }),

/***/ 898:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = __webpack_require__(677);

const ArbitraryBase = __webpack_require__(550);


const SimpleFloatArbBase = ArbitraryBase.extend(
	{
		extend:function(opendown, openup){
			const toFloat = convert.uint32ToFloat(opendown, openup);
			
			return this._super(
				{}, 
				{
					toFloat: toFloat
				}
			);
		}
	},
	
	{
		init:function(min, max){
			[min, max] = convert.ensureFloatArgs(min, max);
			this._super(0xFFFFFFFFn);
			this._min = min;
			this._max = max;
			this.expandFloat = convert.expandFloat(min, max);
		},
		
		_convert:function(value){
			const f = this.toFloat(value);
			return this.expandFloat(f);
		}
	}
);

const O_O = SimpleFloatArbBase.extend(true, true);
const O_I = SimpleFloatArbBase.extend(true, false);
const I_I = SimpleFloatArbBase.extend(false, false);
const I_O = SimpleFloatArbBase.extend(false, true);


module.exports = {
	
	'float':I_O,
	i_i:I_I,
	i_o:I_O,
	o_i:O_I,
	o_o:O_O
};

/***/ }),

/***/ 60:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = {
	ArbitraryBase:__webpack_require__(550),
	ConvertBase:__webpack_require__(923),
	...__webpack_require__(461),
	...__webpack_require__(597),
	...__webpack_require__(322),
	...__webpack_require__(30),
	dict:__webpack_require__(366),
	record:__webpack_require__(143),
	tuple:__webpack_require__(390),
	union:__webpack_require__(351),
	uarray:__webpack_require__(729),
	merge:__webpack_require__(241)
};

/***/ }),

/***/ 794:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

const convert = __webpack_require__(677);

const ArbitraryBase = __webpack_require__(550);

const IntegerArb = ArbitraryBase.extend(
	{
		setup:convert.ensureIntegerArgs,
		
		init:function(min, max){
			this.min = min;
			this.max = max;
			this._super(max - min);

			this._convert = convert.offsetInt(min);
		},
		
		resize: function(fun){
			let [min, max] = fun(this.min, this.max);
			
			return new IntegrArb(min, max);
		}
	}
);

const NatArb = IntegerArb.extend(
	{
		setup:function(max){
			return [0, max || MASK32];
		}
	}
);

const PositArb = IntegerArb.extend(
	{
		setup:function(max){
			return [1, max || MASK32];
		}
	}
);

const ints = {};
[8, 16, 32].forEach((size)=>{
	let full = 2**size;
	ints['uint' + size] = new IntegerArb(0, full-1);
	let half = full/2;
	ints['int' + size] = new IntegerArb(-half, half-1);
});



module.exports = {
	IntegerArb,
	integer:IntegerArb,
	nat:NatArb,
	posit:PositArb,
	
	...ints
};

/***/ }),

/***/ 241:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const ArbitraryBase = __webpack_require__(550);
const ConvertBase = __webpack_require__(923);

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

module.exports = MergeDict;

/***/ }),

/***/ 597:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const BooleanArb = __webpack_require__(576);
const bool = new BooleanArb();

const cnst = __webpack_require__(985);


module.exports = {
	bool,
	cnst,
	constants:cnst,
	'const':cnst,
	elements:__webpack_require__(863),
	...__webpack_require__(794),
	...__webpack_require__(881),
	...__webpack_require__(898)
};

/***/ }),

/***/ 143:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const ArbitraryBase = __webpack_require__(550);

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

/***/ }),

/***/ 561:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const ArbitraryBase = __webpack_require__(550);
const ConvertBase = __webpack_require__(923);

const StringArb = ConvertBase.extend(
	{
		_finalConvert: function(value){
			value = value.flat(Infinity);
			return String.fromCodePoint(...value);
		}
	}
);

module.exports = StringArb;

/***/ }),

/***/ 30:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const string = __webpack_require__(561);
const tuple = __webpack_require__(390);
const {array} = __webpack_require__(461);
const union = __webpack_require__(351);
const chars = __webpack_require__(322);

const ident = function(size){
	if(size.call){
		size = size();
	}
	if(size.resize){
		size = size.resize((min, max)=>([min-1, max-1]));
	}
	else{
		size = size-1;
	}
	return string(tuple([chars.identLeader, array(size, chars.identBody)]));
};

module.exports = {
	string,
	ident
};

/***/ }),

/***/ 390:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const ArbitraryBase = __webpack_require__(550);
const {BigIntPacker} = __webpack_require__(677);

const TupleArb = ArbitraryBase.extend(
	'TupleArbitrary',
	{
		notDefault:true
	},
	{
		init:function(arbs){
			arbs = arbs.map((a)=>(a.call ? a() : a));
			this._fields = arbs;
			if(arbs.every(a=>(a.size))){
				let count = arbs.reduce((akk, a)=>(akk*a.size), 1n);
				this._super(count-1n);
			}
			else{
				this._super();
			}
		},
		
		_convert: function(value){
			const pack = new BigIntPacker(value);
			
			let arr = this._fields.map((arb)=>{
				let val = pack.pop(arb.size);
				return arb.convert(val);
			});
			
			return arr;
		},
		
		_generate: function(randomBigUintLim){
			if(this.pregen){
				return this._super(randomBigUintLim);
			}
			else{
				return this._fields.map((arb)=>(arb.generate(randomBigUintLim)));
			}
		}
	}
);


module.exports = TupleArb;

/***/ }),

/***/ 351:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const convert = __webpack_require__(677);

const ArbitraryBase = __webpack_require__(550);

const UnionArb = ArbitraryBase.extend(
	{notDefault:true},
	{
		init:function(arbs){
			arbs = arbs.map((a)=>(a.call ? a() : a));
			this._fields = arbs;
			if(arbs.every(a=>(a.size))){
				let count = arbs.reduce((akk, a)=>(akk+a.size), 0n);
				this._super(count-1n);
			}
			else{
				this._super();
			}			
		},

		_convert: function(value){
			let arbs = this._fields, len = arbs.length;
			for(let i=0; i<=len; ++i){
				let arb = arbs[i];
				if(value > arb.limit){
					value -= arb.size;
				}
				else{
					return arb.convert(value);
				}
			}
			throw new Error('Неправильно посчитано количество данных в Union');
		}
		
	}
);


module.exports = UnionArb ;

/***/ }),

/***/ 729:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const convert = __webpack_require__(677);

const  {
	uniqueRandom
} = __webpack_require__(140);

const ArbitraryBase = __webpack_require__(550);

const UArrayArb = ArbitraryBase.extend(
	{notDefault:true},
	{
		init:function(size, type){
			if(type.call){
				type = type();
			}
			if(size.call){
				size = size();
			}
			this._size = size;
			if(!type.size){
				throw new TypeError('A type ' + type + ' is not support unique');
			}
			this._type = type;
			this._super();
		},

		_generate: function(randomBigUintLim){
			let size = this._size, type = this._type;
			if(size.generate){
				size = size.generate(randomBigUintLim);
			}
			let raw = uniqueRandom(BigInt(size), type.pregen(randomBigUintLim));
			
			return raw.map(type.proxy('convert'));
		}
	}
);

module.exports = UArrayArb;

/***/ }),

/***/ 265:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const random = __webpack_require__(468);

const TupleArb = __webpack_require__(390);

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
		firstValue = arbitrary.generate(random.randomBigUintLim);
		try{
			let result;
			if(arbitrary instanceof InnerTuple){
				result = property(...firstValue);
			}
			else{
				result = property(firstValue);
			}
			
			if(result && result.err){
				return result;
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

/*
Предполагается, что последним аргументом идёт функция обратного вызова, а перед ней -
	- аргументы, описывающие генерируемые значения, которые потом передадутся в эту функцию
	
	
*/
function curryCheck(args){
	const property = args.pop();
	const arbs = args;
	const arbitrary = arbs.length>1 ? new InnerTuple(arbs) : arbs[0];
	if(!arbitrary){
		throw new Error('No arbitrary');
	}

	return function(){
		return check(arbitrary, property);
	};
}

/**
 * @param func : Function(name, checker) - функция, оборачивающая вызов библиотечной функции проверки
 */
function wrapFuncForProps(func){
	return function property(name, ...args){
		return func(name, curryCheck(args));
	}
}

const propertyMocha = wrapFuncForProps(function(name, checker){
	it(name, function(){
		let res = checker();
		if(res && res.err){
			let test = this.test;
			/*
			что-нибудь про вывод в файл
			[test.file, test.fullTitle(), res.rndState, res.value, res.err]
			*/
			throw res.err;
		}
	});
});

module.exports = {
	check,
	property:propertyMocha,
	random
};

/***/ }),

/***/ 880:
/***/ ((module) => {


const increasingSorter = (a,b)=>(+(b<a)-(a<b));
const decreasingSorter = (a,b)=>(+(b>a)-(a>b));

function makeSorterBy(fun, sorter){
	return (a,b)=>sorter(fun(a),fun(b));
}


/**
 * Транспонировать массив массивов, полагая, что они одной длины
 */
function transposeArrays(data){
	let m = data.length, n = data[0].length;
	let result = Array.from({length:n}, ()=>([]));
	
	for(let i = 0; i<n; ++i){
		for(let j = 0; j<m; j++){
			result[i][j] = data[j][i];
		}
	}
	
	return result;
}

/**
 * Удлинить массив до заданного значения, размножая его элементы, но сохраняя порядок
 */
function repeateItems(arr, nlen){
	let len = arr.length;
	if(len === nlen){
		return arr;
	}
	let mul = nlen/len;
	let result = [];
	for(let i=0; i<nlen; ++i){
		let k = Math.floor(i/mul);
		result[i] = arr[k];
	}
	return result;
}

module.exports = {
	increasingSorter,
	decreasingSorter,
	makeSorterBy,
	
	transposeArrays,
	repeateItems
};

/***/ }),

/***/ 489:
/***/ ((module) => {


class BigIntPacker{
	constructor(value){
		this.value = value;
	}
	
	valueOf(){
		return this.value;
	}
	
	push(base, mod){
		if(mod >= base){
			throw new RangeError('Слишком большое здачения для данного основанияы');
		}
		if(base == 1n){
			return;
		}
		this.value = this.value*base + mod;
	}
	
	pop(base){
		if(base == 1n){
			return 0n;
		}
		let mod = this.value % base;
		this.value = this.value / base;
		
		return mod;
	}
}

module.exports = BigIntPacker;

/***/ }),

/***/ 434:
/***/ ((module) => {

const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;
const BMASK52 = 0x1FFFFFFFFFFFFFn;

/***
 * Исправляет верхний и нижний целый предел
 */
function ensureIntegerArgs(a, b){
	if(typeof b == 'undefined'){
		b = a;
		a = 0;
		if(typeof b == 'undefined'){
			b = MASK32;
		}
	}
	
	return [a, b];
}

/***
 * Исправляет верхний и нижний числовой предел
 */
function ensureFloatArgs(a, b){
	if(typeof b == 'undefined'){
		b = a;
		a = 0;
		if(typeof b == 'undefined'){
			b = 1;
		}
	}

	return [a, b];
}

/***
 * Исправляет статус включения верхнего и нижнего пределов
 */
function ensureFloatLim(opendown, openup){
	opendown = (opendown === true);
	openup = (openup !== false);
	
	return [opendown, openup];
}

/***
 * @function uint32ToFloat
 * @param opendown? : Boolean=false - открытый снизу
 * @param openup? : Boolean=true - открытый снизу
 * @return Function<number, number> - преобразует целое число [0, 0xFFFFFFFF] в действительное 0..1 с принятым включением пределов
 */
function uint32ToFloat(opendown, openup){
	opendown = (opendown === true);
	openup = (openup !== false);
	const a = 0 + opendown;
	const d = MASK32 + openup + a;

	return (intval)=>((a + intval)/d);
}

/***
 * @function expandFloat
 * @param a
 * @param b
 * @return Function<number, number> - преобразует число из отрезка [0;1] в отрезок [a;b]
 */
function expandFloat(a, b){
	[a,b] = ensureFloatArgs(a, b);
	return (value)=>(a + value*(b-a));
}

function offsetInt(offset){
	offset = Number(offset);
	return (value)=>(Number(value)+offset);
}

function offsetBigInt(offset){
	offset = BigInt(offset);
	return (value)=>(BigInt(value)+offset);
}

function offsetValue(offset, T){
	offset = T(offset);
	return (value)=>(T(value)+offset);
}

module.exports = {
	uint32ToFloat,
	expandFloat,
	offsetInt,
	offsetBigInt,
	offsetValue,
	
	ensureIntegerArgs,
	ensureFloatArgs,
	ensureFloatLim
};

/***/ }),

/***/ 677:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = {
	BigIntPacker:__webpack_require__(489),
	...__webpack_require__(434),
	...__webpack_require__(880),
	...__webpack_require__(110)
	
};

/***/ }),

/***/ 110:
/***/ ((module) => {


/**
 * Разложить число в массив разрядов в системе base
 */
function decomp(value, base){
	let arr = [], i=0;
	let current = value;
	while(current>0n){
		arr[i] = current % base;
		current = current / base;
		++i;
	}
	return arr;
}

/**
 * Срезать ведущие нули
 */
function cutZero(arr){
	while(arr[arr.length-1] === 0n){
		arr.pop();
	}
	
	return arr;
}

/**
 * Суммировать массив разрядов в системе base
 */
function comp(arr, base){
	let value = 0n;
	for(let i=arr.length; i--;){
		value *= base;
		value += arr[i];
	}
	return value;
}

function offset(arr, summ){
	return arr.map((x)=>(x+summ));
}

/**
 * Преобразовать число из системы base в безнулевую систему base
 * @param arr : Array<BigInt[0..base-1]>
 * @param base : BigInt - количество цифр системы
 * @return Array<BigInt[1..base]>
 *
 * comp(arr, base) === comp(withoutZero(arr, base), base);
 */
function withoutZero(arr, base){
	cutZero(arr);
	//предполагаем, что после этого в последнем элементе не ноль
	for(let i = 0, max = arr.length-1; i<max; ++i){
		if(arr[i]<=0n){
			arr[i] += base;
			arr[i+1]--;
		}
	}
	cutZero(arr);
	//Получен массив значений 1..base
	
	return arr;
}

/**
 * Количество значений, представимых в системе base не более size разрядов
 */
function countWithZero(size, base){
	return base ** size;
}

/**
 * Количество значений, представимых в безнулевой системе base не более size разрядов
 */
function countWithoutZero(size, base){
	let res = 1n;
	for(let i = size; i--;){
		res = res*base + 1n;
	}
	return res;
}

module.exports = {
	decomp,
	comp,
	withoutZero,
	
	cutZero,
	offset,
	
	countWithZero,
	countWithoutZero
}

/***/ }),

/***/ 237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = {
	property: (__webpack_require__(265).property),
	arb: __webpack_require__(60)
}

/***/ }),

/***/ 140:
/***/ ((module) => {

/***
 * Представляет собой упорядоченное множество целых неотрицательных чисел, которые
 * первоначально стоят по порядку, под индексами, равными значению,
 * но их можно обменивать местами
 */
class PermutatedTail extends Map{
	/**
	 * Метод получения числа по индексу
	 */
	get(index){
		if(this.has(index)){
			return super.get(index);
		}
		else{
			return index;
		}
	}
	
	/**
	 * Метод обмена позиций во множестве значениями
	 * @param a - индекс первого числа
	 * @param b - индекс второго числа
	 */
	swap(a, b){
		let A = this.get(a);
		let B = this.get(b);
		
		this.set(b, A);
		this.set(a, B);
	}
}

/**
 * @function uniqueRandom - генерирует массив уникальных случайных значений с помощью функции генератора
 * @param n : Int - количество генерируемых значений
 * @param gen : Pregen - генератор случайных значений
 * @return Array[n]<BigInt> - массив уникальных случайных значений
 */
function uniqueRandom(n, gen){
	let tail = new PermutatedTail();

	let result = [];
	for(let i = 0; i<n; ++i){
		let alt = BigInt(i);
		let k = gen(alt);
		let v = tail.get(k);
		result.push(v);
		tail.swap(k, alt);
	}
	
	return result;
}

module.exports = {
	uniqueRandom
};

/***/ }),

/***/ 327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const prover = __webpack_require__(237);

module.exports.prover = prover;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(327);
/******/ 	this.prover = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=prover.js.map