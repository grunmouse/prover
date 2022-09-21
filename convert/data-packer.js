/*
JS data packer
Задача: упаковать данные заданного типа единственным образом

Структура данных
<тип>[<размер>][<данные>]

Поддерживаемые типы:
Undefined
Null
Boolean (константы для true и false)
Number - всегда храним в float64
BigInt - размер, данные
String - размер, UTF-16
Array - последовательность вложенных значений с терминатором
Object - последовательность вложенных пар ключ-значение с терминатором (ключ и значения - являются значениями, роль определяется их следованием)

Константы типов

0000 0000 undefined
0000 0001 null
0000 0010 false
0000 0011 true
0000 0100 number
0000 0101 +bigint
0000 0110 -bigint
0000 0111 string
0000 1000 array
0000 1001 object
0000 1111 mark  - терминатор

*/

const UNDEFINED = 0;
const NULL = 1;
const FALSE = 2;
const TRUE = 3;
const NUMBER = 4
const POS_BIGINT = 5;
const NEG_BIGINT = 6;
const STRING = 7;
const ARRAY = 8;
const OBJECT = 9;
const MARK = 16;

const {bigint} = require('@grunmouse/binary');

const convertUndefined = ()=>(Uint8Array.of(0).buffer);
const convertNull = ()=>(Uint8Array.of(1).buffer);

const symMark = Symbol();

function countByteLength(item){
	switch(typeof item){
		case 'undefined':
			return 1;
		case 'boolean':
			return 1;
		case 'number':
			return 9;
		case 'bigint':
			if(item === 0n){
				return 5;
			}
			else{
				if(item<0){
					item = -item;
				}
				let over2 = Number(bigint.over2(item));
				let over256 = Math.ceiling(over2/8);
				return 5+over256;
			}
		case 'string':
			return 1 + 4 + item.length*2;
		case 'object':
			if(item == null){
				return 1;
			}
			else if(Array.isArray(item)){
				return item.reduce((akk, a)=>(akk+countByteLength(a)), 2);
			}
			else{
				return Object.entries(item).reduce((akk, [key, value)=>{
					return countByteLength(key)+countByteLength(value);
				}, 2)
			}
		default:
			throw new TypeError('Тип не поддерживается');
	}
}


function convertBoolean(value){
	let type = value ? 3 : 2;
	return Uint8Array.of(type).buffer
}

function convertNumber(value){
	const type = 4;
	const size = 9;

	const buffer = new ArrayBuffer(size);
	const dv = new DataView(buffer);
	
	dv.setUint8(0, type);
	dv.setFloat64(1, value); //Big Endian не специфицируем

	return buffer;
}

function convertString(str){
	const type = 7;
	const len = str.length;
	const size = 1 + 4 + len*2;
	
	const buffer = new ArrayBuffer(size);
	const dv = new DataView(buffer);
	
	dv.setUint8(0, type);
	dv.setUint32(1, len, true);
	for(let i = 0; i<len; ++i){
		let offset = 5 + i*2;
		dv.setUint16(offset, str.charCodeAt(i), false); //Big Endian
	}
	
	return buffer;
}

function convertBigInt(value){
	let type;
	if(value<0){
		type = NEG_BIGINT;
		value = -value;
	}
	else{
		type = POS_BIGINT;
	}
	
	let buffer = bigint.toBuffer(value);
	let size = buffer.byteLength;
	let arr = new Uint8Array(buffer, 5);
	arr[0] = type;
	let dv = new DataView(arr.buffer);
	dv.setUint32(1, size, true);
	
	return arr.buffer;
}

function *genConvertAnyData(item){
	switch(typeof item){
		case 'undefined':
			yield convertUndefined();
			break;
		case 'boolean':
			yield convertBoolean(item);
			break;
		case 'number':
			yield convertNumber(item);
			break;
		case 'bigint':
			yield convertBigInt(item);
			break;
		case 'string':
			yield convertString(item);
		case 'object':
			if(item == null){
				yield convertNull();
			}
			else if(Array.isArray(item)){
				yield* genConvertArray(item);
			}
			else{
				yield* genConvertObject(item);
			}
			break;
		default:
			throw new TypeError('Тип не поддерживается');
	}
}

function *genConvertArray(arr){
	yield Uint8Array.of(ARRAY).buffer;
	for(let item of arr){
		yield *genConvertAnyData(item);
	}
	yield Uint8Array.of(MARK).buffer;
}

function *genConvertObject(obj){
	yield Uint8Array.of(OBJECT).buffer;
	let keys = Object.keys(obj);
	keys.sort();
	for(let i = 0; i< keys.length; ++i){
		let key = keys[i];
		let item = obj[key];
		yield convertString(key);
		yield *genConvertAnyData(item);
	}
	yield Uint8Array.of(MARK).buffer;
}

function convertData(data){
	const chunks = [...genConvertAnyData(data)];
	const size = chunks.reduce((akk, buffer)=>(akk+buffer.byteLength), 0);
	
	const aout = new Uint8Array(size), offset = 0;
	for(let i = 0; i<chunks.length; ++i){
		let buffer = chunks[i];
		aout.set(buffer, offset);
		offset += buffer.byteLength;
	}
	
	return aout.buffer;
}

function readBigUint(dv, offset){
	let size = dv.getUint32(offset, true);
	offset += 4;
	let raw = db.buffer.slice(offset, offset+size);
	offset += size;
	
	let value = bigint.fromBuffer(raw);
	
	return [value, offset]
}

function readString(dv, offset){
	let size = dv.getUint32(offset, true);
	offset += 4;
	let arr = [];
	for(let i = 0; i<len; ++i){
		let charCode = dv.getUint16(offset, false); //Big Endian
		arr.push(charCode);
		offset+=2;
	}
	let value = String.fromCharCode(...arr);
	
	return [value, offset];
}

function readArray(dv, offset){
	let arr = [];
	while(true){
		let [value, newoffset] = readData(dv, offset);
		offset = newoffset;
		if(value === symMark){
			break;
		}
		else{
			arr.push(value);
		}
	}
	return [arr, offset];
}

function readObject(dv, offset){
	let obj={};
	while(true){
		let [key, valoffset] = readData(dv, offset);
		if(value === symMark){
			offset = valoffset;
			break;
		}
		else{
			let [value, newoffset] = readData(dv, valoffset);
			offset = newoffset;
			obj[key] = value;
		}
	}
	return [obj, offset];
}

function readData(dv, offset){
	const type = dv.getUint8(offset);
	switch(type){
		case UNDEFINED:
			return [undefined, offset+1];
		case NULL:
			return [null, offset+1];
		case FALSE:
			return [false, offset+1];
		case TRUE:
			return [true, offset+1];
		case NUMBER:
			return [dv.getFloat64(offset+1), offset+9];
		case POS_BIGINT:
		{
			let [value, newoffset] = readBigUint(dv, offset+1);
			return [value, newoffset];
		}
		case NEG_BIGINT:
		{
			let [value, newoffset] = readBigUint(dv, offset+1);
			return [-value, newoffset];
		}
		case STRING:
			return readString(dv, offset+1);
		case ARRAY:
			return readArray(dv, offset+1);
		case OBJECT:
			return readObject(dv, offset+1);
		case MARK:
			return [symMark, offset+1];
	}
}

function toBigInt(data){
	let buffer = convertData(data);
	
	return bigint.fromBuffer(buffer);
}

function fromBigInt(value){
	let buffer = bigint.toBuffer(value);
	let dv = new DataView(buffer);
	
	let data = readData(dv, 0);
	
	return data;
}


module.exports = {
	/**
	 * @param dv : DataView
	 * @param offset : Int32
	 * @return any
	 */
	readData,

	/**
	 * @param data : any
	 * @return ArrayBuffer
	 */
	convertData,
	
	/**
	 * @param data : any
	 * @return BigInt
	 */
	toBigInt,
	
	/**
	 * @param value : BigInt
	 * @return any
	 */
	 fromBigInt
}