const MASK32 = 0xFFFFFFFF; //Часто встречается
const OVER32 = MASK32+1;
const BMASK32 = 0xFFFFFFFFn;

/***
 * Исправляет верхний и нижний целый предел
 */
function ensureIntegerArgs(a, b){
	if(typeof b == 'undefined'){
		b = a;
		a = 0;
		if(typeof b == 'undefined'){
			b = MASK32;
		}
	}
	
	return [a, b];
}

/***
 * Исправляет верхний и нижний числовой предел
 */
function ensureFloatArgs(a, b){
	if(typeof b == 'undefined'){
		b = a;
		a = 0;
		if(typeof b == 'undefined'){
			b = 1;
		}
	}

	return [a, b];
}

/***
 * Исправляет статус включения верхнего и нижнего пределов
 */
function ensureFloatLim(opendown, openup){
	opendown = (opendown === true);
	openup = (openup !== false);
	
	return [opendown, openup];
}

/***
 * @function uint32ToFloat
 * @param opendown? : Boolean=false - открытый снизу
 * @param openup? : Boolean=true - открытый снизу
 * @return Function<number, number> - преобразует целое число [0, 0xFFFFFFFF] в действительное 0..1 с принятым включением пределов
 */
function uint32ToFloat(opendown, openup){
	opendown = (opendown === true);
	openup = (openup !== false);
	const a = 0 + opendown;
	const d = MASK32 + openup + a;

	return (intval)=>((a + intval)/d);
}

/***
 * @function expandFloat
 * @param a
 * @param b
 * @return Function<number, number> - преобразует число из отрезка [0;1] в отрезок [a;b]
 */
function expandFloat(a, b){
	[a,b] = ensureFloatArgs(a, b);
	return (value)=>(a + value*(b-a));
}

function offsetInt(offset){
	offset = Number(offset);
	return (value)=>(Number(value)+offset);
}

function offsetBigInt(offset){
	offset = BigInt(offset);
	return (value)=>(BigInt(value)+offset);
}

function offsetValue(offset, T){
	offset = T(offset);
	return (value)=>(T(value)+offset);
}

module.exports = {
	uint32ToFloat,
	expandFloat,
	offsetInt,
	offsetBigInt,
	offsetValue,
	
	ensureIntegerArgs,
	ensureFloatArgs,
	ensureFloatLim
};