const assert = require("assert").strict;
const sinon = require('sinon');
const {property:prop} = require('../check.js');
const arb = {
	...require('../arbitrary/primitive.js'),
	...require('../arbitrary/array.js')
};
	
describe('arbitrary', ()=>{
	describe('sized array', ()=>{
		prop('generate', arb.posit(100), (size)=>{
			let a = arb.sarray(size, arb.uint8);
			let val = a.generate();
			
			assert.equal(val.length, size);
			assert.ok(val.every((item)=>(item>=0 && item<256)));
		});
		prop('convert', arb.posit(100), (size)=>{
			let a = arb.sarray(size, arb.uint8);
			
			let val0 = a.convert(0n);
			
			assert.equal(val0.length, size);
			assert.ok(val0.every((item)=>(item==0)));

			let val1 = a.convert(a.limit);
			
			assert.equal(val1.length, size);
			assert.ok(val1.every((item)=>(item==255)));
		});
	});
	describe('limited array', ()=>{
		prop('generate', arb.posit(100), (size)=>{
			let a = arb.larray(size, arb.uint8);
			let val = a.generate();
			
			assert.ok(val.length <= size);
			assert.ok(val.every((item)=>(item>=0 && item<256)));
		});
		prop('convert', arb.posit(100), (size)=>{
			let a = arb.larray(size, arb.uint8);
			
			let val0 = a.convert(0n);
			
			assert.equal(val0.length, 0);
			assert.ok(val0.every((item)=>(item==0)));

			let val1 = a.convert(a.limit);
			
			assert.equal(val1.length, size);
			assert.ok(val1.every((item)=>(item==255)));
		});
	});	
	describe('array', ()=>{
		prop('generate', arb.posit(100), arb.posit(100), (min, max)=>{
			if(min > max){
				[min, max] = [max, min];
			}
			let a = arb.array(arb.integer(min, max), arb.uint8);
			let val = a.generate();
			
			assert.ok(val.length <= max && val.length >= min);
			assert.ok(val.every((item)=>(item>=0 && item<256)));
		});
		prop('convert', arb.posit(100), arb.posit(100), (min, max)=>{
			if(min > max){
				[min, max] = [max, min];
			}
			let a = arb.array(arb.integer(min, max), arb.uint8);
			
			let val0 = a.convert(0n);
			
			assert.equal(val0.length, min);
			assert.ok(val0.every((item)=>(item==0)));

			let val1 = a.convert(a.limit);
			
			assert.equal(val1.length, max);
			assert.ok(val1.every((item)=>(item==255)));
		});
	});
});