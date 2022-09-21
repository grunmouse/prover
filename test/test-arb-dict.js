
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
const dict = require('../arbitrary/dict.js');

describe('dict', ()=>{
	prop('generate', dict(10, strings.ident(5), arb.uint32), (value)=>{
		let entries = Object.entries(value);
		assert.equal(entries.length, 10, 'size');
		assert.ok(entries.every(([key, _])=>(/^[A-Za-z$_][0-9A-Za-z$_]*$/.test(key))), 'keys');
		assert.ok(entries.every(([_,value])=>(Number.isInteger(value))), 'values');
	});
});