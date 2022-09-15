
const convert = require('../convert/index.js');

const  {
	uniqueRandom
} = requery('../random/unique-random.js');

const ArbitraryBase = require('./arbitrary-base.js');

const UArrayArb = ArbitraryBase.extend(
	{
		init:function(size, type){
			if(type.call){
				type = type();
			}
			if(size.call){
				size = size();
			}
			this._size = size;
			if(!type.count){
				throw new TypeError('A type ' + type + ' is not support unique');
			}
			this._type = type;
			this._super();
		},

		_generate: function(){
			let size = this._size, type = this._type;
			if(size.generate){
				size = size.generate();
			}
			let raw = uniqueRandom(tsize, type.pregen);
			return raw.map(type.proxy('convert'));
		}
	}
);

module.exports = UArrayArb;