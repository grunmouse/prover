const {inspect} = require('util');
const {inspect:extInspect} = require('./inspect/inspect.js');
const {inspect:myInspect} = require('./inspect.js');
const traverse = require('./traverse.js');
const {compareInspectors} = require('./err_diff.js');

let a = {type:"a"};

a.me = a;

class MyClass{};

class MyArray extends Array{};

Array.prototype.protoProp = "own in proto";
let e = new WeakSet([{ a: 1 }, { b: 2 } ]);
let b = {type:"b", a:1, b:2, c:3, obj: new MyClass(), arr:new MyArray(), wset:e};
let d = {type:"d"};
let c = new Map([["x","x"], ["y","y"], [a, d], [d,0], [0, b], [b, a]]);
c.prop = "own prop";
b.me = b;
b.childs = [a, a];
b.childs["key"] = "keyed";
b.childs[-1]=-1;
a.parent = b;
b.map = c;


let config = {depth:100, colors:true};

//console.log(inspect(b, config));
//console.log(inspect(traverse(b), {depth:10, colors:true}));

//console.log(compareInspectors(extInspect, inspect, c, config));

let objNumber = {
	toString:function(){
		console.log('toString');
		return '0';
	},
	valueOf:function(){
		console.log('valueOf');
		return 0;
	}
};

console.log(Object.entries(Object.getOwnPropertyDescriptors([1,2,3])));
//console.log([1,2][objNumber]);