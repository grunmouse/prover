
const convert = require('../convert/index.js');

const ArbitraryBase = require('./arbitrary-base.js');

const {integer} = require('./privitive.js');
const union = require('./union.js');

const NodeArb = ArbitraryBase.extend(
	{
		init:function(deep, tail, makeNode){
			this._deep = deep;
			this._tail = tail;
			this._makeNode = makeNode;
			
			this._super();
		},
		
		_generate:function(){
			const deep = this._deep;
			const tail = this._tail, makeNode = this._makeNode;

			if(deep == 0){
				return tail.generate();
			}
			else{
				let arb = new RecursiveArb(deep-1, tail, makeNode);
				let item = union([tail, arb]);
				
				return makeNode(arb).generate();
			}

		}
	}
);

const RecursiveArb = ArbitraryBase.extend(
	{
		init:function(deep, tail, makeNode){
			if(deep.call){
				deep = deep();
			}
			if(tail.call){
				tail = tail();
			}
			this._deep = deep;
			this._tail = tail;
			this._makeNode = makeNode;
			
			this._super();
		},
		
		_generate:function(){
			const deep = this._deep.generate ? this._deep.generate : this._deep;
			const tail = this._tail, makeNode = this._makeNode;

			let arb = new RecursiveArb(deep-1, tail, makeNode);
			let arb = new RecursiveArb(deep-1, tail, makeNode);
			let item = union([tail, arb]);
			
			return makeNode(arb).generate();

		}
	}
);