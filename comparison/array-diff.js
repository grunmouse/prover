
/**
 * Сравнивает массивы, один из которых короткий
 * Если оба массива длинные - возвращает undefined
 */
function smallArrayDiff(a, b, itemCompare){
	if(a.length === 0){
		if(b.length === 0){
			return [{status:'common', value:[]}];
		}
		else{
			return [{status:'deleted', value:b.slice(0)}];
		}
	}
	else if(b.length === 0){
		return [{status:'added', value:a.slice(0)}];
	}
	
	function findOne(longed, one, compare, status){
		let index=0, len = longed.length;
		for(;index<len;++index){
			let cmp = compare(longed[index], one);
			if(+cmp){
				if(cmp === true) cmp = one;
				let prev = longed.slice(0, index);
				let post = longed.slice(index+1);
				let result = [];
				if(prev.length){
					result.push({status, value:prev});
				}
				result.push({status:'common', value:[cmp]});
				if(prev.length){
					result.push({status, value:post});
				}
				
				return result;
			}
		}
	}
	
	if(a.length === 1){
		if(b.length === 1){
			let cmp = itemCompare(a[0], b[0]);
			if(+cmp){
				if(cmp === true) cmp = a[0];
				return [{status:'common', value:[cmp]}];
			}
			else{
				return [
					{status:'deleted', value:b.slice(0)},
					{status:'added', value:a.slice(0)}
				];
			}
		}
		else{
			let result = findOne(b, a, (b, a)=>(itemCompare(a, b)), 'deleted');
			if(!result){
				result = [
					{status:'deleted', value:b.slice(0)},
					{status:'added', value:a.slice(0)}
				];
			}
			return result;
		}
	}
	else if(b.length === 1){
		let result = findOne(a, b, (a, b)=>(itemCompare(a, b)), 'added');
		if(!result){
			result = [
				{status:'deleted', value:b.slice(0)},
				{status:'added', value:a.slice(0)}
			];
		}
		return result;
	}	
}

function sortedArrayDiff(a, b, itemCompare, itemSorter){

	let i=0, j=0, m = a.length, n = b.length;
	let diff = [], current;
	function append(status, item){
		if(!current || status !== current.status){
			current = {status, value:[]};
			diff.push(current);
		}
		current.value.push(item);
	}
	function append2(status, a, b){
		if(!current || status !== current.status){
			current = {status, a:[],b:[]};
			diff.push(current);
		}
		current.a.push(a);
		current.b.push(b);
	}
	function addTail(source, index, len, status){
		if(index<len){
			let part = source.slice(index)
			if(current.status === status){
				current.value = current.value.concat(part);
			}
			else{
				diff.push({status, value:part});
			}
		}
	}
	
	//группируем по сортировке
	while(i<m && j<n){
		let order = itemSorter(a[i], b[j]);
		if(order === 0){
			append2('unsorted', a[i], b[i]);
			++i;
			++j;
		}
		else if(order<0){
			append('added', a[i]);
			++i;
		}
		else if(order>0){
			append('deleted', b[j]);
			++j
		}
	}

	addTail(b, j, n, 'deleted');
	addTail(a, i, m, 'added');
	
	for(let i=diff.length; i--;){
		if(diff[i].status==='unsorted'){
			let subdiff = arrayDiff(diff[i].a, diff[i].b, itemCompare);
			diff.splice(i, 1, ...subdiff);
		}
	}

	return diff;
}


function arrayDiff(a, b, itemCompare){
	let substrings = [];
	
	let m = a.length, n = b.length;
	let previous = [];
	for(let i = 0; i<m; ++i){
		let current = []
		for(let j = 0; j<n; ++j){
			let cmp = itemCompare(a[i], b[j]);
			if(+cmp){
				let substr = previous[j-1];
				if(cmp === true) cmp = b[j];
				if(substr){
					substr.length++;
					substr.result.push(cmp);
				}
				else{
					substr = {i, j, length: 1, result:[cmp]};
					substrings.push(substr);
				}
				current[j] = substr;
			}
			else{
				
			}
		}
		previous = current;
	}
	
	substrings = substrings.map((item)=>{
		let length = item.result.length;
		return {
			i:item.i,
			j:item.j,
			length,
			k: item.i + length - 1,
			l: item.j + length - 1,
			source:item
		};
	});
	let fixed = [];
	const sorter = (a, b)=>{
		return a.length - b.length || 
			Math.abs(b.i+b.k - m) - Math.abs(a.i+a.k - m) || 
			Math.abs(b.j+b.l - n) - Math.abs(a.j+a.l - n);
	};
	
	while(substrings.length){
		substrings.sort(sorter);
		
		let selected = substrings.pop();
		fixed.push(selected);

		//Удаляем поглощённые
		substrings = substrings.filter((item)=>{
			if(item.i<selected.i && item.j < selected.j){
				return true;
			}
			else if(item.k>selected.k && item.l>selected.l){
				return true;
			}
			return false;
		});

		//Усекаем пересекаемые
		substrings.forEach((item)=>{
			if(item.i < selected.i && item.k >= selected.i || item.j<selected.j && item.j >= selected.j){
				let c = Math.max(item.k - selected.i, item.l - selected.j)+1;
				item.length -= c;
				item.k -= c;
				item.l -= c;
			}
			if(item.k > selected.k && item.i <= selected.k || item.l > selected.l && item.j <= selected.l){
				let c = Math.max(selected.k - item.i, selected.l - item.j)+1;
				item.length -= c;
				item.i += c;
				item.j += c;
			}
		});
	}
	
	
	fixed.sort((a, b)=>(a.i - b.i));
	fixed[-1] = {k:-1, l:-1, lenght:0};
	fixed.push({i:a.length, j:b.length, length:0});
	
	let diff = [];
	
	for(let i=0; i<fixed.length; ++i){
		let prev = fixed[i-1];
		let next = fixed[i];
		if(next.j-prev.l>1){
			let removing = b.slice(prev.l+1, next.j);
			diff.push({status:'deleted', value:removing});
		}
		if(next.i-prev.k>1){
			let adding = a.slice(prev.k+1, next.i);
			diff.push({status:'added', value:adding});
		}
		if(next.length>0){
			let matching = next.source.result.slice(next.i - next.source.i, next.k - next.source.i + 1);
			diff.push({status:'common', value:matching});
		}
	}
	
	return diff;
	
}

function groupArrayKeys(arr, tupleLength){
	tupleLength = tupleLength || 0;
	
	const isIndex = (key)=>{
		if(isNaN(key)) return false;
		key = +key;
		return Number.isInteger(key) && key>=0 && key < array.length;
	};
	
	let keys = Object.keys(arr);
}

module.exports = {
	arrayDiff,
	sortedArrayDiff,
	smallArrayDiff
};