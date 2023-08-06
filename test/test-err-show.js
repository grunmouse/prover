const {check} = require('../check.js');
const assert = require('assert');
const Mocha = require('Mocha');


describe('show error', ()=>{
	it('show error', function(){
		
		let arb = {generate:()=>(void(0)), shrink:()=>([])};
		let prop = function(){
			assert(false);
		}
		let res = check(arb, prop);
		
		let test = this.test;
		
		console.log([test.file, test.fullTitle(), res.rndState, res.value, res.err]);
		
		//throw res.err;
		
		//console.log(this);
	});
	
	it('show ok', ()=>{
		assert.equal(1,1);
	});
	
	it('err', ()=>{
		//assert.equal(1,2);
	});
	
	it('obj', ()=>{
		let err = new assert.AssertionError({
			actual: [1,2,3,6,7,8],
			expected: [1,2,3,4,5,6,7,8],
			operator: 'deepStrictEqual',
		});
		console.log(err.message);
		//throw err;
	});
});