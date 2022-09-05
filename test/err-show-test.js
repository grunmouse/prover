const {check} = require('../check.js');
const assert = require('assert');

describe('show error', ()=>{
	it('show error', ()=>{
		let arb = {generate:()=>(void(0)), shrink:()=>([])};
		let prop = function(){
			assert(false);
		}
		let err = check(arb, prop);
		//assert(false);
		throw err.err;
	});
});