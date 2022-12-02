const Class = require('./class.js');

const pregen = (maxLimit)=>(randomLim)=>(minLimit=0n)=>(randomLim(maxLimit-minLimit)+minLimit);

const ArbitraryBase = Class.extend(
	{

		pregen:pregen,
		
		extend:function(klass, proto){
			if(!proto){
				proto = klass;
				klass = undefined;
			}
			if(proto.limit){
				let lim = BigInt(proto.limit);
				proto.limit = limit;
				proto.size = limit+1n;
				proto.pregen = this.pregen(limit);
			}
			
			return this._super(klass, proto);
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
				this.pregen = this.Class.pregen(limit);
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