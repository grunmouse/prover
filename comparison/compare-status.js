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

CompareStatus.join = joinStatus;

module.exports = CompareStatus;