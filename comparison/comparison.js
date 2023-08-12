
class CompareStatus{
	constructor(status, difference){
		this.status = status;
		this.difference = difference;
	}
	
	valueOf(){
		return this.status === true || this.status === 'equal';
	}
}

function Comparator(classify, mapping){
	function doCompare(a, b, options){
		let clsA = classify(a);
		let clsB = classify(b);
		
		if(clsA !== clsB){
			return false;
		}
		
		let comparator = mapping[clsA];
		
		if(!comparator){
			throw new Error('Unknown comparator for type "' + clsA + '"');
		}
		
		options = options || {}
		return comparator(a, b, options, doCompare)
	}
	
	return doCompare;
}

function class2type(obj){
	if(obj == null){
		return String(obj);
	}
	else{
		return obj.constructor.name;
	}
}

function strict(a, b){
	return new CompareStatus(a === b, {actual:a, expected:b});
}

function approx(a, b, options){
	return Math.abs(a-b)<=options.eps;
}

function arrayComparator(a, b, options, doCompare){
	let diff = arrayDiff(a, b, doCompare);
	let status = diff.length === 1 && diff[0].status === 'common';
	
	return new CompareStatus(status, diff);
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

const {inspect} = require('util');
let cmp = Comparator(class2type, {Array:arrayComparator, Number:strict, String:strict, BigInt:strict});

let arr1 = [1,2,3,4,5,6,1,2,3];
let arr2 = [3, 4, 5, 0, 1, 2, 3];

console.log(inspect(cmp(arr1, arr2), {depth:10, colors:true}));