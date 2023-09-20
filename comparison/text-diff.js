
function textDiff(a, b){
	let substrings = [];
	//Массивы кодовых точек
	a = [...a];
	b = [...b];
	let m = a.length, n = b.length;
	let previous = [];
	for(let i = 0; i<m; ++i){
		let current = []
		for(let j = 0; j<n; ++j){
			let cmp = a[i] === b[j];
			if(cmp){
				let substr = previous[j-1];
				cmp = b[j];
				if(substr){
					substr.length++;
				}
				else{
					substr = {i, j, length: 1};
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
		let length = item.length;
		return {
			i:item.i,
			j:item.j,
			length,
			k: item.i + length - 1,
			l: item.j + length - 1
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
			let removing = b.slice(prev.l+1, next.j).join('');
			diff.push({status:'deleted', value:removing});
		}
		if(next.i-prev.k>1){
			let adding = a.slice(prev.k+1, next.i).join('');
			diff.push({status:'added', value:adding});
		}
		if(next.length>0){
			let matching = a.slice(next.i, next.k + 1).join('');
			diff.push({status:'common', value:matching});
		}
	}
	
	return diff;
}

function stringParallelDiff(a, b, itemCompare){
	a = [...a];
	b = [...b];
	let len = Math.min(a.length, b.length);
	
	let result = [], status = a.length === b.length;
	
	let current;
	for(let i=0; i<len; ++i){
		let cmp = a[i] === b[i];
		if(!current || (current.status==='common') !== (!!+cmp)){
			current = {status: +cmp ? 'common' : 'difference', value : []};
			result.push(current);
		}
		current.value.push(cmp);
	}
	
	if(a.length > len){
		result.push({status:'added', value: a.slice(len)});
	}
	else if(b.length > len){
		result.push({status:'deleted', value: b.slice(len)});
	}	
	
	result.forEach((item)=>{
		item.value = item.value.join('');
	});
	
	return result;
}


module.exports = {
	textDiff,
	stringParallelDiff
};