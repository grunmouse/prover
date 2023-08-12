
const mapping = {
	'Array':function(value, doTraverse){
		return value.map(doTraverse);
	},
	'Object':function(value, doTraverse){
		const result = {};
		for(let key in value) if(value.hasOwnProperty(key)){
			result[key] = doTraverse(value[key]);
		}
		return result;
	},
	'Set':function(value, doTraverse){
		const result = new Set();
		for(let item of value){
			result.add(doTraverse(item));
		}
		return result;
	},
	'Map':function(value, doTraverse){
		const result = new Map();
		for(let pair of value){
			result.set(pair[0], doTraverse(pair[1]));
		}
		return result;
	}
};

function class2type(value){
	return value == null ? String(value) : value.constructor.name;
}

function traverse(value){
	const circ = new Map();
	const refs = [];
	
	function doTraverse(value){
		let type = class2type(value);
		let traverser = mapping[type];
		
		let result = {type:type};
		if(traverser){
			if(circ.has(value)){
				let ref = circ.get(value);
				result = {type:'*circular', id:ref.id};
				ref.links.push(result);
			}
			else{
				let ref = {type:'*ref', id:Symbol(), links:[]};
				circ.set(value, ref);
				result.value = traverser(value, doTraverse);
				circ.delete(value);
				if(ref.links.length>0){
					result.ref = ref;
					refs.push(ref);
				}
				
			}
		}
		else{
			result.value = value;
		}
		
		return result;
	}
	
	let result = doTraverse(value);

	refs.forEach((ref, index)=>{
		ref.id = index;
		ref.links.forEach((link)=>{
			link.id = index;
		});
		delete ref.links;
	});

	return result;
}

module.exports = traverse;