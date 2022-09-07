const {check} = require('../check.js');
const assert = require('assert');
const Mocha = require('Mocha');
describe('show error', ()=>{
	it('show error', function(){
		let arb = {generate:()=>(void(0)), shrink:()=>([])};
		let prop = function(){
			assert(false);
		}
		let err = check(arb, prop);
		throw err.err;
		
		//console.log(this);
	});
	
	it('show ok', ()=>{
		assert.equal(1,1);
	});
	
	it('err', ()=>{
		assert.equal(1,2);
	});
});