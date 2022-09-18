/***
 * Представляет собой упорядоченное множество целых неотрицательных чисел, которые
 * первоначально стоят по порядку, под индексами, равными значению,
 * но их можно обменивать местами
 */
class PermutatedTail extends Map{
	/**
	 * Метод получения числа по индексу
	 */
	get(index){
		if(this.has(index)){
			return super.get(index);
		}
		else{
			return index;
		}
	}
	
	/**
	 * Метод обмена позиций во множестве значениями
	 * @param a - индекс первого числа
	 * @param b - индекс второго числа
	 */
	swap(a, b){
		let A = this.get(a);
		let B = this.get(b);
		
		this.set(b, A);
		this.set(a, B);
	}
}

/**
 * @function uniqueRandom - генерирует массив уникальных случайных значений с помощью функции генератора
 * @param n : Int - количество генерируемых значений
 * @param gen : Pregen - генератор случайных значений
 * @return Array[n]<BigInt> - массив уникальных случайных значений
 */
function uniqueRandom(n, gen){
	let tail = new PermutatedTail();

	let result = [];
	for(let i = 0; i<n; ++i){
		let alt = BigInt(i);
		let k = gen(alt);
		let v = tail.get(k);
		result.push(v);
		tail.swap(k, alt);
	}
	
	return result;
}

module.exports = {
	uniqueRandom
};