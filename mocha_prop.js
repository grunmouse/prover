const {wrapFuncForProps} = require('./checker.js');

const propertyMocha = wrapFuncForProps(function(name, checker){
	it(name, function(){
		let res = checker();
		if(res && res.err){
			let test = this.test;
			/*
			что-нибудь про вывод в файл
			[test.file, test.fullTitle(), res.rndState, res.value, res.err]
			*/
			throw res.err;
		}
	});
});

module.exports = propertyMocha;