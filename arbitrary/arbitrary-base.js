const Class = require('./class.js');

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
			
			if(cls.defaultConfig){
				let dflt = new cls(...cls.defaultConfig);
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