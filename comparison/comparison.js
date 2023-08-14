const {
	arrayDiff,
	sortedArrayDiff,
	smallArrayDiff
} = require('./array-diff.js');

const {
	setDiff
} = require('./set-diff.js');

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


const {inspect} = require('util');
let cmp = Comparator(class2type, {Array:arrayComparator, Number:strict, String:strict, BigInt:strict});

let arr1 = [1,2,3,4,5,6,1,2,3];
let arr2 = [3, 4, 5, 0, 1, 2, 3];

console.log(inspect(cmp(arr1, arr2), {depth:10, colors:true}));