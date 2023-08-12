const {inspect} = require('./inspect/inspect.js');
const {inspect:myInspect} = require('./inspect.js');
const traverse = require('./traverse.js');
const AssertionError = require('./assertion_error')
let a = {type:"a"};

a.me = a;

Array.prototype.protoProp = "own in proto";
let b = {type:"b", a:1, b:2, c:3};
let d = {type:"d"};
let c = new Map([["x","x"], ["y","y"], [a, d], [d,0], [0, b], [b, a]]);
c.prop = "own prop";
b.me = b;
b.childs = [a, a];
b.childs["key"] = "keyed";
b.childs[-1]=-1;
a.parent = b;
b.map = c;


let config = {depth:10, colors:true};

console.log(inspect(b, config));
//console.log(inspect(traverse(b), {depth:10, colors:true}));