const {
	integer,
	uint8,
	uint16
} = require('./primitive.js');

const cnst = require('./constants.js');s
const union = require('./union.js');

const octet = uint8;
const ascii = integer(32,0xFE);

const digit = integer(0x30, 0x39);

const latUp = integer(0x41, 0x5A);
const latLow = integer(0x61, 0x7A);

const rusUp = union([cnst(0x401), integer(0x410,0x42F)]);
const rusLow = union([integer(0x430, 0x44F), cnst(0x451)]);

const lat = union([latUp, latLow]);

const rus = union([rusUp, rusLow]);

const _ = cnst("_".codePointAt(0));
const $ = cnst("$".codePointAt(0));

const identLeader = union([latUp, latLow, _, $]);

const identBody = union([digit, latUp, latLow, _, $]);

module.exports = {
	octet,
	ascii,
	digit,
	lat,
	latUp,
	latLow,
	rus,
	rusUp,
	rusLow,
	identLeader,
	identBody
};