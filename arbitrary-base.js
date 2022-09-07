const Class = require('./class.js');

const random = require('@grunmouse/big-random');

const ArbitraryBase = Class.extend(
	{
		
	}, 
	{
		init:function(attributes){
			const limit = BigInt(attributes.limit);
			this.pregen_limit = limit;
			this.pregen_count = limit+1n;
		},
		
		generate:function(){
			let raw = this.pregen();
			return this.convert(raw);
		},
		
		pregen:function(a=0n){
			a = BigInt(a);
			return random.randomBigUintLim(this.pregen_limit-a)+a;
		},
		
		convert:function(value){
			return value;
		},
		
		stringify:function(value){
			return ''+value;
		}
	}
);