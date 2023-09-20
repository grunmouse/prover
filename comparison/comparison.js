const {
	arrayDiff,
	sortedArrayDiff,
	arrayParallelDiff,
	smallArrayDiff,
	
	isIndex,
	notIsIndex,
	arrayStatus,
	sortedDiffMethod
} = require('./array-diff.js');

const {
	setDiff
} = require('./set-diff.js');

const {
	textDiff,
	stringParallelDiff
} = require('./text-diff.js');

const {
	strict,
	ignore,
	approxNumber
} = require('./cmp-primitive.js');

/*
support
*/



function citeObject(source, keys){
	let result = {};
	for(let key of keys){
		result[key] = source[key];
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

function citeMap(source, keys){
	let result = new Map();
	for(let key of keys){
		result.set(key, source.get(key));
	}
	return result;
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

function ext(extItemCompare){
	return function ext(getExtKeys){
		return function(a, b){
			let extKeysA = getExtKeys(a);
			let extKeysB = getExtKeys(b);
			
			return propsByKeys(a, b, extKeysA, extKeysB, extItemCompare);
		}
	}
}

function tail(start, tailCompare){
	return function(a, b){
		return tailCompare(a.slice(start), b.slice(start));
	}
}


function joinComparator(entries, Into, argtype){
	if(typeof Into === 'string'){
		argtype = Into;
		Into = undefined;
	}
	
	if(entries.length === 1){
		return entries[0][1];
	}
	
	const fun = function(a, b){
		let status = true;
		let diff = !!Into ? new Into() : {};
		
		for(let [key, comparator] of entries){
			let value = comparator(a, b);
			diff[key] = value.difference;
			status = status && (+value);
		}
		
		return new CompareStatus(status, diff);
	}	
	
	fun.argtype = argtype;
	
	return fun;
}


/*
 /support
*/

/*
comparators
*/


function text(a, b){
	let diff = textDiff(a, b, itemCompare);
	let status = arrayStatus(diff);
	
	return new CompareStatus(status, diff);
}
text.argtype = "string";



function array(itemCompare, diffMethod){
	diffMethod = diffMethod || arrayDiff;
	let fun = function diff_array(a, b){
		let diff = diffMethod(a, b, itemCompare);
		let status = arrayStatus(diff);
		
		return new CompareStatus(status, diff);
	}
	fun.argtype = "array";
	return fun;
}

function arrayParallel(itemCompare){
	return array(itemCompare, arrayParallelDiff);
}

function sortedArray(itemCompare, itemSorter){
	return array(itemCompare, sortedDiffMethod(itemSorter));
}

function objectAsDict(itemCompare){
	let fun = function dict_object(a, b){
		let aKey = Object.keys(a), bKey = Object.keys(b);

		return propsByKeys(a, b, aKey, bKey, itemCompare);
	}
	fun.argtype = "object";
	return fun;
}

function objectAsStruct(struct){
	const fields = Object.entries(struct);
	let fun = function(a, b){
		let diff = diffStruct(a, b, fields, {});
		return new CompareStatus(diff.status, diff.diff);
	}
	fun.argtype = "object";
	return fun;
}

function tuple_array(struct){
	const fields = struct.map((value, i)=>([i, value]));
	let fun = function tuple_array(a, b){
		let diff = diffStruct(a, b, fields, []);
		return new CompareStatus(diff.status, diff.diff);
	}
	fun.argtype = "array";

	return fun;
}

function fields_object(config){
	let extStruct = config.struct;
	let extComparator = config.ext;
	
	
	let fields = [];

	if(extStruct){
		fields.push(['struct', objectAsStruct(extStruct)]);
	}
	if(extComparator){
		if(extComparator.name !== 'ext'){
			extComparator = ext(extComparator);
		}

		let filter;
		if(extStruct){
			if(config.notIndex){
				filter = (a)=>{
					const notIndex = notIsIndex(a.length, 0);
					return (key)=>(notIndex(key) && !extStruct.hasOwnProperty(key));
				};
			}
			else{
				filter = ()=>(key)=>(!extStruct.hasOwnProperty(key));
			}
			
		}
		else{
			if(config.notIndex){
				filter = (a)=>(notIsIndex(a.length, 0));
			}
			else{
				filter = ()=>()=>(true);
			}
		}

		let getExtKeys = (a)=>Object.keys(a).filter(filter(a));

		
		fields.push(['ext', extComparator(getExtKeys)]);
	}
	
	return fields;
}

function fields_array(config){
	let fields = [];
	let tupleStruct = config.tuple || [];
	let tailComparator = config.tail;
	let extStruct = config.struct;
	let extComparator = config.ext;
	
	if(extComparator === true){
		extComparator = tailComparator;
	}
	
	if(tupleStruct.length > 0){
		fields.push(['tuple', tuple_array(tupleStruct)]);
	}
	if(tailComparator){
		fields.push([tupleStruct.length > 0 ? 'tail' : 'array', tail(tupleStruct.length, tailCompare)]);
	}
	
	fields.push(...fields_object({struct:extStruct, ext:extComparator, notIndex:true}));
	
	return fields;
}

function tuple(tupleStruct, tailComparator, extStruct, extComparator){
	if(tailComparator && typeof tailComparator === "function" && tailComparator.name === "ext"){
		//extComparator 001
		extComparator = tailComparator;
		extStruct = undefined;
		tailComparator = undefined;
	}
	else if(tailComparator && typeof tailComparator === "object"){
		//extStruct 010
		//extStruct, extComparator 011
		extComparator = extStruct;
		extStruct = tailComparator;
		tailComparator = undefined;
	}
	else if(extStruct && typeof extStruct === "function"){
		//tailComparator, extComparator 101
		extComparator = extStruct;
		extStruct = undefined;
	}
	//else{
	//tailComparator 100
	//tailComparator, extStruct 110
	//tailComparator, extStruct, extComparator 111
	//}
	
	let fields = fields_array({
		tuple:tupleStruct,
		tail:tailComparator,
		struct:extStruct,
		ext:extComparator
	});

	fun = joinComparator(fields);

	return fun;
}

function struct(extStruct, extComparator){
	if(extStruct && typeof extStruct === "function"){
		extComparator = extStruct;
		extStruct = undefined;
	}
	

	let fields = fields_object({struct:extStruct, ext:extComparator});

	fun = joinComparator(fields);

	return fun;
}


function cmpMap(itemCompare){
	let fun = function(a, b){
		let aKey = a.keys(), bKey = b.keys();
		
		return mapItemsByKeys(a, b, aKey, bKey, itemCompare);
	}
	fun.argtype = "Map";
	return fun;
}

function cmpSet(a, b){
	let diff = setDiff(a, b);
	
	let status = (added.size === 0) && (deleted.size === 0);
	
	return new CompareStatus(status, diff);
}

cmpSet.argtype = "Set";

function set(a, b){
	if(a && b){
		return cmpSet(a, b);
	}
	if(!b && typeof a === 'object'){
		return propExtWrapper(['set', cmpSet], a);
	}
	
	return cmpSet;
}

set.argtype = "Set";

function propExtWrapper(base, extConfig){
	let extFields = Array.isArray(extConfig) ? extConfig : fields_object(extConfig);
	
	let fields = [base,	...extFields];
	
	return joinComparator(fields);
}

function map(itemCompare, extConfig){
	return propExtWrapper(['map', cmpMap(itemCompare)], extConfig);
}



module.exports = {
	strict,
	ignore,
	
	approxNumber,
	
	text,
	
	array,
	arrayParallel,
	sortedArray,
	tuple,

	
	objectAsDict,
	objectAsStruct,
	struct,
	
	map,
	
	set,
	
	joinComparator
};