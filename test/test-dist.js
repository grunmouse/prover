const fs = require('fs');
const Path = require('path');

const vm = require('vm');

const context = vm.createContext({
});

let code = fs.readFileSync('./dist/prover.js', {encoding:'utf8'});
	var script = new vm.Script(code);
	try{
		script.runInContext(context);
	}
	catch(err){
		console.log(err.stack);
		throw err;
	}
	
	console.log(Object.keys(context));