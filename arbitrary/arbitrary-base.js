const Class = require('./class.js');

const random = require('@grunmouse/big-random');

const pregen = (randomLim)=>(b)=>(a=0n)=>(randomLim(b-a)+a);

const ArbitraryBase = Class.extend(
	{
		pregen:(b)=>(a=0n)=>(random.randomBigUintLim(b-a)+a),
		
		extend:(klass, proto){
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
			if(limit){
				let limit = BigInt(limit);
				this.limit = limit;
				this.size = limit+1n;
				this.pregen = this.Class.pregen(limit);
			}
		},
		
		generate:function(){
			let raw = this.pregen();
			return this.convert(raw);
		},
		
		convert:function(value){
			return value;
		},
		
		stringify:function(value){
			return ''+value;
		}
	}
);

module.exports = ArbitraryBase;