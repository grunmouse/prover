
const {
	MASK32,
	MASK20,
	OVER32,
	BMASK32,
	
	intMask,
	bigintMask,
	over2
} = require('./binary.js');

const random = require('@grunmouse/big-random');

const randomUInt = random.randomUint32Lim;

function randomBool(tr, of){
	return random.randomUint32Lim(of)<tr;
}


function randomBigUIntBySize(len){
	let byteLen = Math.floor(len/8);
	let mask = (1n<<BigInt(len))-1n;
	
	let result = random.randomBigUint(byteLen) & mask;
	
	return result;
}

const randomBigUInt = random.randomBigUintLim;

/**
 * @typedef Pregen<T> : Function<(min=0, [size])=>(T)> - Функция генерации дискретных случайных значений
 * @property T : Function - конструктор используемого типа данных - Number или BigInt
 * @property limit : T - максимальное генерируемое значение
 * @property count : T - число возможных значений count = limit+1
 * @property bigint? : Boolean = T===BigInt - признак, что функция возвращает BigInt
 * @param min : T - минимальное генерируемое значение значение
 * @param size? : Number - необязательный параметр генерации, может использоваться в jsverify
 * @return T - сгенерированное случайное значение в диапазоне [min; limit] & Z
 *
 * 
 */

/**
 * @function pregenUInt
 * @param b? : Int32
 * @return Pregen<Int32>{limit = b}
 */
function pregenUInt(b=MASK32){
	const pregen = (a=0)=>(randomUInt(b-a)+a);
	pregen.limit = b;
	pregen.count = b+1;
	pregen.T = Number;
	
	return pregen;
}

/**
 * @function pregenBigUInt
 * @param b : Int32|BigInt
 * @return Pregen<BigInt>{limit = b}
 */
function pregenBigUInt(b){
	b = BigInt(b);
	const pregen = (a=0n)=>{
		a = BigInt(a);
		return randomBigUInt(b-a)+a;
	};
	pregen.limit = b;
	pregen.count = b+1n;
	pregen.T = BigInt;
	pregen.bigint = true;
	return pregen;
}

module.exports = {
	randomUInt,
	randomBigUInt,
	randomBigUIntBySize,
	randomBool,
	
	pregenUInt,
	pregenBigUInt
};