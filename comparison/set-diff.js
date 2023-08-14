
function setDiff(a, b){
	let common = new Set(), added = new Set, deleted = new Set(b);
	
	for(let key of a){
		if(b.has(key)){
			common.add(key);
			deleted.delete(key);
		}
		else{
			added.add(key);
		}
	}
	
	return {
		added,
		deleted,
		common
	};
}

module.exports = {
	setDiff
};