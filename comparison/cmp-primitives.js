
const CompareStatus = require('./compare-status.js');


function strict(a, b){
	return new CompareStatus(a === b, {actual:a, expected:b});
}
strict.argtype = "any";

function ignore(){
	return new CompareStatus(true, 'ignored');
}
ignore.argtype = "any";

function approxNumber(eps){
	let fun = function approx_number(a, b){
		return new CompareStatus(Math.abs(a-b)<=eps, {actual:a, expected:b, eps});
	};
	fun.argtype = "number";
	return fun;
	
}


module.exports = {
	strict,
	ignore,
	approxNumber
};