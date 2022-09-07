


class AbstractArbitrary {

	constructor(limit){
		this.pregen_limit = BigInt(limit);
		this.pregen_count = limit + 1n;
		
	}
	
	generate(){
		let raw = this.pregen();
		return this.convert(raw);
	}
	
	pregen(a=0n){
		a = BigInt(a);
		return randomBigUInt(this.pregen_limit-a)+a;
	}
	
	convert(value}{
		return value;
	}
	
	shrink(){
	}
	
	stringify(value){
		return ''+value;
	}
	
	map(convert, shrink, toString){
	}
}

