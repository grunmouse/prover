
/**
 * Разложить число в массив разрядов в системе base
 */
function decomp(value, base){
	let arr = [], i=0;
	let current = value;
	while(current>0n){
		arr[i] = current % base;
		current = current\base;
		++i;
	}
	return arr[0];
}

/**
 * Срезать ведущие нули
 */
function cutZero(arr){
	while(arr[arr.length-1] === 0n){
		arr.push();
	}
	
	return arr;
}

/**
 * Суммировать массив разрядов в системе base
 */
function comp(arr, base){
	let value = 0n;
	for(let i=arr.length; i--;){
		value *= base;
		value += arr[i];
	}
	return value;
}

function offset(arr, summ){
	return arr.map((x)=>(x+summ));
}

/**
 * Преобразовать число из системы base в безнулевую систему base
 * @param arr : Array<BigInt[0..base-1]>
 * @param base : BigInt - количество цифр системы
 * @return Array<BigInt[1..base]>
 *
 * comp(arr, base) === comp(withoutZero(arr, base), base);
 */
function withoutZero(arr, base){
	cutZero(arr);
	//предполагаем, что после этого в последнем элементе не ноль
	for(let i = 0, max = arr.length-1; i<max; ++i){
		if(arr[i]===0n){
			arr[i] = base;
			arr[i+1]--;
		}
	}
	cutZero(arr);
	//Получен массив значений 1..base
}

/**
 * Количество значений, представимых в системе base не более size разрядов
 */
function countWithZero(size, base){
	return base ** size;
}

/**
 * Количество значений, представимых в безнулевой системе base не более size разрядов
 */
function countWithoutZero(size, base){
	let res = 1n;
	for(let i = size; i--;){
		res = res*base + 1n;
	}
	return res;
}

module.exports = {
	decomp,
	comp,
	withoutZero,
	
	cutZero,
	offset,
	
	countWithZero,
	countWithoutZero
}