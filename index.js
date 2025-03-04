const {check, property, wrapFuncForProps} = require('./check.js');
module.exports = {
	property,
	check,
	wrapFuncForProps,
	arb: require('./arbitrary/index.js')
}