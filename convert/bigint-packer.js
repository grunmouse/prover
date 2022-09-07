
class BigIntPacker{
	constructor(value){
		this.value = value;
	}
	
	valueOf(){
		return this.value;
	}
	
	push(base, mod){
		this.value = this.value*base + mod;
	}
	
	pop(base){
		let mod = this.value % base;
		this.value = this.value / base;
		
		return mod;
	}
}

module.exports = BigIntPacker;