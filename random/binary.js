
const intMask = (size)=>((1<<size)-1); //До 31

const bigintMask = (size)=>((1n<<BigInt(size))-1n);

const MASK32 = 0xFFFFFFFF; //Часто встречается
const MASK20 = 0xFFFFF;
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;

function over2(value){
	let b=1n;
	while(value > (1n<<b)){
		b = b<<1n;
	}
	let a = b>>1n;

	while((b-a)>1n){
		m = (a+b)>>1n;
		if(value>>m){
			a = m;
		}
		else{
			b = m;
		}
	}
	
	if(value === 1n<<a){
		return a;
	}
	else{
		return b;
	}
}

module.exports = {
	MASK32,
	MASK20,
	OVER32,
	BMASK32,
	
	intMask,
	bigintMask,
	over2
};