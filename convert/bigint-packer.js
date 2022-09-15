
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