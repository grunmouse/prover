const assert = require("assert").strict;
const {property:prop} = require('../check.js');
const arb = require('../arbitrary/primitive.js');
const sinon = require('sinon');

describe('arbitrary', ()=>{
	describe('bool', ()=>{
		prop('generate', arb.bool, (a)=>{
			assert.ok(typeof a === 'boolean');
			assert.ok(a === false || a === true);
		});
		it('convert', function(){
			assert.equal(arb.bool.convert(0), false);
			assert.equal(arb.bool.convert(1), true);
		});
	});
	
	describe('integer', ()=>{
		prop('generate', arb.integer(-3, 5), (a)=>{
			assert.ok(typeof a === 'number');
			assert.ok(Number.isInteger(a));
			assert.ok(a <= 5);
			assert.ok(a >= -3);
		});
		it('convert', function(){
			const a = arb.integer(-3, 5);
			
			assert.equal(a.convert(0), -3);
			assert.equal(a.convert(a.limit), 5);
		});
	});
	
	[
		['int8', -0x80, 0x7F],
		['int16', -0x8000, 0x7FFF],
		['int32', -0x80000000, 0x7FFFFFFF],
		['uint8', 0, 0xFF],
		['uint16', 0, 0xFFFF],
		['uint32', 0, 0xFFFFFFFF]
	].forEach(([name, min, max])=>{
		describe(name, ()=>{
			prop('generate', arb[name], (a)=>{
				assert.ok(typeof a === 'number');
				assert.ok(Number.isInteger(a));
				assert.ok(a <= max);
				assert.ok(a >= min);
			});
			it('convert', function(){
				const a = arb[name];
				
				assert.equal(a.convert(0), min);
				assert.equal(a.convert(a.limit), max);
			});
		});
	});	

	describe('bigint', ()=>{
		prop('generate', arb.bigint(-3, 5), (a)=>{
			assert.ok(typeof a === 'bigint');
			assert.ok(a <= 5n);
			assert.ok(a >= -3n);
		});
		it('convert', function(){
			const a = arb.bigint(-3n, 5n);
			
			assert.equal(a.convert(0), -3n);
			assert.equal(a.convert(a.limit), 5n);
		});
	});
	
	[
		['bigint32', -(2n<<30n), (2n<<30n)-1n],
		['bigint64', -(2n<<62n), (2n<<62n)-1n],
		['bigint128', -(2n<<126n), (2n<<126n)-1n],
		['biguint32', 0n, (2n<<31n)-1n],
		['biguint64', 0n, (2n<<63n)-1n],
		['biguint128', 0n, (2n<<127n)-1n]
	].forEach(([name, min, max])=>{
		describe(name, ()=>{
			prop('generate', arb[name], (a)=>{
				assert.ok(typeof a === 'bigint');
				assert.ok(a <= max);
				assert.ok(a >= min);
			});
			it('convert', function(){
				const a = arb[name];
				
				assert.equal(a.convert(0), min);
				assert.equal(a.convert(a.limit), max);
			});
		});
	});
	
	
	describe('elements', ()=>{
		prop('generate', arb.elements(['a', 'b', 'c']), (a)=>{
			assert.ok('abc'.indexOf(a)>-1);
		});
		it('convert', function(){
			const arr = ['a', 'b', 'c'];
			const a = arb.elements(arr);
			assert.equal(a.limit, BigInt(arr.length-1));
			for(let i =0; i< arr.length; ++i){
				assert.equal(a.convert(i), arr[i]);
			}
		});
	});
	
	describe('uint32ToFloat', ()=>{
		it('[0,1)', ()=>{
			const a = arb.i_o();
			assert.equal(a.convert(0), 0);
			assert.ok(a.convert(0xFFFFFFFF) < 1);
		});
		it('(0,1)', ()=>{
			const a = arb.o_o();
			assert.ok(a.convert(0) > 0);
			assert.ok(a.convert(0xFFFFFFFF) < 1);
		});
		it('(0,1]', ()=>{
			const a = arb.o_i();
			assert.ok(a.convert(0) > 0);
			assert.equal(a.convert(0xFFFFFFFF), 1);
		});
		it('[0,1]', ()=>{
			const a = arb.i_i();
			assert.equal(a.convert(0), 0);
			assert.equal(a.convert(0xFFFFFFFF), 1);
		});
	});
	
	
});