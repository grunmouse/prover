const assert = require("assert").strict;
const sinon = require('sinon');
const {property:prop, random} = require('../check.js');
const arb = {
	...require('../arbitrary/primitive.js'),
	...require('../arbitrary/array.js')
};

const uarray = require('../arbitrary/unique-array.js');

describe('uarray', ()=>{
	describe('with const size', ()=>{
		prop('generate', arb.posit(100), (size)=>{
			const a = uarray(size, arb.uint8);
			let val = a.generate(random.randomBigUintLim);
			
			assert.equal(val.length, size, 'size');
			let s = new Set(val);
			assert.equal(val.length, s.size, 'unique');
			assert.ok(val.every(x=>(0<=x && x<256)));
		});
	});
	
	describe('with arb size', ()=>{
		prop('generate', arb.posit(100), arb.posit(100), (min, max)=>{
			if(min>max){
				[min, max] = [max, min];
			}
			const a = uarray(arb.integer(min, max), arb.uint8);
			
			let val = a.generate(random.randomBigUintLim);
			
			assert.ok(val.length >=min && val.length <=max, 'size');
			let s = new Set(val);
			assert.equal(val.length, s.size, 'unique');
			assert.ok(val.every(x=>(0<=x && x<256)));
		});
	});
});