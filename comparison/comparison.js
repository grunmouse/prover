const {
	arrayDiff,
	sortedArrayDiff,
	smallArrayDiff
} = require('./array-diff.js');

const {
	setDiff
} = require('./set-diff.js');

const {
	textDiff
} = require('./text-diff.js');

class CompareStatus{
	constructor(status, difference){
		this.status = status;
		this.difference = difference;
	}
	
	valueOf(){
		return this.status === true || this.status === 'equal';
	}
}

function joinStatus(entries, into){
	let status = true;
	into = into || {};
	for(let [key, value] of entries){
		into[key] = value.difference;
		status = status && (+value);
	}
	
	return new CompareStatus(status, into);
}

/*
support
*/

function isIndex(over, min=0){
	return (key)=>{
		key = +key;
		return !isNaN(key) && key<over && key>=min;
	};
}

function notIsIndex(over, min=0){
	return (key)=>{
		key = +key;
		return isNaN(key) || key>=over || key<min;
	};
}

function arrayStatus(diff){
	return diff.length === 1 && diff[0].status === 'common';
}

function citeObject(source, keys){
	let result = {};
	for(let key of keys){
		result[key] = source[key]
	}
	return result;
}

function citeMap(source, keys){
	let result = new Map();
	for(let key of keys){
		result.set(key, source.get(key));
	}
	return result;
}

function propsByKeys(a, b, aKey, bKey, itemCompare){
	let {added, deleted, common} = setDiff(aKey, bKey);
	
	let status = (added.size === 0) && (deleted.size === 0)
	
	let com = {};
	for(let key of common){
		let cmp = itemCompare(a[key], b[key]);
		com[key] = cmp;
		status = status && (+cmp);
	}

	return new CompareStatus(
		status,
		{
			added: citeObject(a, added),
			deleted: citeObject(b, deleted),
			common: com
		}
	);
}
function mapItemsByKeys(a, b, aKey, bKey, itemCompare){
	let {added, deleted, common} = setDiff(aKey, bKey);
	
	let status = (added.size === 0) && (deleted.size === 0)
	
	let com = new Map();
	for(let key of common){
		let cmp = itemCompare(a.get(key), b.get(key));
		com.set(key, cmp);
		status = status && (+cmp);
	}

	return new CompareStatus(
		status,
		{
			added: citeMap(a, added),
			deleted: citeMap(b, deleted),
			common: com
		}
	);
}

function diffStruct(a, b, fields, into){
	let status = true;
	for(let [key, compare] of fields){
		let cmp = compare(a[key], b[key]);
		into[key] = cmp;
		status = status && (+cmp);
	}
	
	return {status, diff:into};
}

function ext(getExtKeys, extItemCompare){
	return function(a, b){
		let extKeysA = getExtKeys(a);
		let extKeysB = getExtKeys(b);
		
		return propsByKeys(a, b, extKeysA, extKeysB, extItemCompare);
	}
}

function tail(start, itemCompare){
	return function(a, b){
		let diff = arrayDiff(a.slice(start), b.slice(start), itemCompare);
		let status = diff.length === 1 && diff[0].status === 'common';
		
		return new CompareStatus(status, diff);		
	}
}


function joinComparator(entries, Into){
	function(a, b){
		let status = true;
		let diff = !!Into ? new Into : {};
		
		for(let [key, comparator] of entries){
			let value = comparator(a, b);
			diff[key] = value.difference;
			status = status && (+value);
		}
		
		return new CompareStatus(status, diff);
	}	
}


/*
 /support
*/

/*
comparators
*/
function strict(a, b){
	return new CompareStatus(a === b, {actual:a, expected:b});
}

function approxNumber(eps){
	return function(a, b){
		return new CompareStatus(Math.abs(a-b)<=eps, {actual:a, expected:b, eps});
	}
}

function text(a, b){
	let diff = textDiff(a, b, itemCompare);
	let status = arrayStatus(diff);
	
	return new CompareStatus(status, diff);
}

function array(itemCompare){
	return function(a, b){
		let diff = arrayDiff(a, b, itemCompare);
		let status = arrayStatus(diff);
		
		return new CompareStatus(status, diff);
	}
}

function objectAsDict(itemCompare){
	return function(a, b){
		let aKey = Object.keys(a), bKey = Object.keys(b);

		return propsByKeys(a, b, aKey, bKey, itemCompare);
	}
}

function map(itemCompare){
	return function(a, b){
		let aKey = a.keys(), bKey = b.keys();
		
		return mapItemsByKeys(a, b, aKey, bKey, itemCompare);
	}
}

function set(a, b){
	let diff = setDiff(a, b);
	
	let status = (added.size === 0) && (deleted.size === 0);
	
	return new CompareStatus(status, diff);
}

function objectAsStruct(struct){
	const fields = Object.entries(struct);
	return function(a, b){
		let diff = diffStruct(a, b, fields, {});
		return new CompareStatus(diff.status, diff.diff);
	}
}

function tuple(struct){
	const fields = struct.map((value, i)=>([i, value]));
	return function(a, b){
		let diff = diffStruct(a, b, fields, []);
		return new CompareStatus(diff.status, diff.diff);
	}
}

function arrayExt(itemCompare, extItemCompare){
	extItemCompare = extItemCompare || itemCompare;
	
	const getExtKeys = (a)=>Object.keys(a).filter(notIsIndex(a.length, 0));
	
	return joinComparator([['array', array(itemCompare)], ['ext', ext(getExtKeys, extItemCompare)]]);
}

function structExt(struct, extItemCompare){
	
	function getExtKey(a){
		return Object.keys(a).filter((key)=>(!struct.hasOwnProperty(key)));
	}
	
	return joinComparator([['struct', objectAsStruct(struct)], ['ext', ext(getExtKeys, extItemCompare)]]);
}

function mapExt(itemCompare, extItemCompare){
	extItemCompare = extItemCompare || itemCompare;
	
	const getExtKeys = (a)=>Object.keys(a);
	
	return joinComparator([['map', map(itemCompare)], ['ext', ext(getExtKeys, extItemCompare)]]);
}

function setExt(extItemCompare){
	extItemCompare = extItemCompare || itemCompare;
	
	const getExtKeys = (a)=>Object.keys(a);
	
	return joinComparator([['set', set], ['ext', ext(getExtKeys, extItemCompare)]]);
}

function tupleExt(struct, extItemCompare){
	
	const getExtKeys = (a)=>Object.keys(a).filter(notIsIndex(a.length));
	
	return joinComparator([['tuple', tuple(struct)], ['ext', ext(getExtKeys, extItemCompare)]]);
}

function tupleLong(struct, itemCompare){
	const tupleCompare = tuple(struct);
	const arrayCompare = array(itemCompare);
	const tupleLen = struct.length;
	
	return joinComparator([['tuple', tuple(struct)], ['tail', tail(tupleLen, itemCompare)]]);
}


module.exports = {
	strict,
	
	approxNumber,
	
	text,
	
	array,
	tuple,
	arrayExt,
	tupleExt,
	tupleLong,
	
	objectAsDict,
	objectAsStruct,
	structExt,
	
	map,
	mapExt,
	
	set,
	setExt
};