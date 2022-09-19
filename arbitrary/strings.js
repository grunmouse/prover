const string = require('./string-base.js');
const tuple = require('./tuple.js');
const {array} = require('./array.js');
const union = require('./union.js');
const chars = require('./char.js');

const ident = function(size){
	if(size.call){
		size = size();
	}
	if(size.resize){
		size = size.resize((min, max)=>([min-1, max-1]));
	}
	else{
		size = size-1;
	}
	return string(tuple([chars.identLeader, array(size, chars.identBody)]));
};

module.exports = {
	ident
};