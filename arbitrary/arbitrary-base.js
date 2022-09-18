const Class = require('./class.js');

const random = require('@grunmouse/big-random');

const pregen = (randomLim)=>(b)=>(a=0n)=>(randomLim(b-a)+a);

const ArbitraryBase = Class.extend(
	{
		pregen:(b)=>(a=0n)=>(random.randomBigUintLim(b-a)+a),
		
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
		init:function(limit){
			if(limit != null){
				limit = BigInt(limit);
				this.limit = limit;
				this.size = limit+1n;
				this.pregen = this.Class.pregen(limit);
			}
		},
		
		_generate:function(){
			let raw = this.pregen();
			return this._convert(raw);
		},
		
		generate:function(){
			return this._finalConvert(this._generate());
		},
		
		convert:function(value){
			let raw = value.call ? value(this.limit) : value;
			return this._finalConvert(this._convert(raw));
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