const assert = require("assert");
const chk = require('../check.js');
const constants = require('../arbitrary/constants.js');
const sinon = require('sinon');


describe("check", function () {
	
	chk.property('property args', constants(1), constants(2), constants(4), (...args)=>{
		let [a, b, c] = args;
		assert.equal(args.length, 3);
		assert.equal(a, 1);
		assert.equal(b, 2);
		assert.equal(c, 4);
	});
	
	it('check count', ()=>{
		const test1 = sinon.spy((a)=>{
			assert.equal(a, 1);
		});
		
		let res = chk.check(constants(1), test1);
		
		assert.equal(test1.callCount, 100);
		
	});
});