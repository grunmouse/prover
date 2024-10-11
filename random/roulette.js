const random = require('./random.js');

/**
 * @param wheel : Array<Int32>
 */
function roulette(wheel, random){
	
	const len = wheel.length;
	let sr = wheel.reduce((akk, x)=>(akk+x/len), 0);
	
	const prob = wheel.slice(0);
	const alias = [];
	const s = new Set(wheel.map((_,i)=>(i)));
	
	function setAlias(al, into){
		let move = sr - prob[into];
		s.delete(into);
		alias[into] = al;
		prob[al] = prob[al] - move;
	}
	
	while(s.size){
		let l = prob.findIndex((p, i)=>(s.has(i) && p<sr));
		let g = prob.findIndex((p)=>(p>sr));
		if(g>-1){
			setAlias(g, l);
		}
	}
	
	return ()=>{
		let x = random.randomUint32Lim(0, len-1);
		let y = random.randomUint32Lim(sr)<prob[x];;
		
		return y ? x : alias[x];
	}
	
}

module.exports = roulette;