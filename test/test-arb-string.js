
const assert = require("assert").strict;
const sinon = require('sinon');
const {property:prop} = require('../check.js');
const arb = {
	...require('../arbitrary/primitive.js'),
	...require('../arbitrary/array.js')
};
const tuple = require('../arbitrary/tuple.js');
const string = require('../arbitrary/string-base.js');
const cnst = require('../arbitrary/constants.js');
const strings = require('../arbitrary/strings.js');


describe('string', ()=>{
	describe('string-base converter', ()=>{
		it('sample 1', function(){
			const sample = 'Hello, World!';
			const arr = [...sample].map((a)=>a.codePointAt(0)); //code points
			
			const a = string(cnst(arr));
			
			let val = a.generate();
			
			assert.equal(val, sample);
		});
	});
	describe('ident', ()=>{
		prop('generate', strings.ident(3), (str)=>{
			assert.ok(typeof str === 'string', 'string');
			assert.equal(str.length, 3, 'length');
			assert.ok(/^[A-Za-z$_][0-9A-Za-z$_]*$/.test(str), 'a ident')
		});
	});
});