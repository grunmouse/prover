
const assert = require("assert").strict;
const sinon = require('sinon');
const {property:prop} = require('../check.js');
const tuple = require('../arbitrary/tuple.js');
const {uint8} = require('../arbitrary/integer.js');
const record = require('../arbitrary/record.js');
const cnst = require('../arbitrary/constants.js');

describe('record', ()=>{
	prop('generate', record({a:cnst(1), b:uint8, c:uint8, d:cnst(2)}), (value)=>{
		//console.log(value);
		assert.equal(value.a, 1);
		assert.equal(value.d, 2);
		assert.ok(value.b>=0 && value.b<256);
		assert.ok(value.c>=0 && value.c<256);
	});
	/* it('convert', function(){
		 let arb = record({a:cnst(1), b:uint8, c:uint8, d:cnst(2)});
		 assert.deepEqual(arb.convert(0), {a:1, b:0, c:0, d:2});
		 assert.deepEqual(arb.convert(65535), {a:1, b:255, c:255, d:2});
	}); */
});

describe('tuple', ()=>{
	prop('generate', tuple([cnst(1), uint8, uint8, cnst(2)]), (value)=>{
		assert.ok(Array.isArray(value));
		assert.equal(value[0], 1);
		assert.equal(value[3], 2);
		assert.ok(value[1]>=0 && value[1]<256);
		assert.ok(value[2]>=0 && value[2]<256);
	});
	it('convert', function(){
		 let arb = tuple([cnst(1), uint8, uint8, cnst(2)]);
		 assert.deepEqual(arb.convert(0n), [1,0,0,2]);
		 assert.deepEqual(arb.convert(65535n), [1, 255, 255, 2]);
	});
});