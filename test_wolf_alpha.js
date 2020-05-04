const WolframAlphaAPI = require('@dguttman/wolfram-alpha-api');


const waApi = WolframAlphaAPI('23G8YJ-WG8RA742Q6');


const msg = "what's quantum physics";

waApi.getFull({
  input: msg,
  includepodid: 'Result',
  output: 'json',
}).then((queryresult) => {
	console.log(queryresult)
	if(queryresult && queryresult.success) {
		if(queryresult.assumptions) {
			console.log(queryresult.assumptions);
			console.log('using assumptiom = ' + queryresult.assumptions.values[1].input)
			queryAssumption(msg, queryresult.assumptions.values[1].input);
		}
		// console.log(queryresult.pods[0])
  		// console.log(queryresult.pods[0].subpods[0].plaintext);
	} else{
		console.log('no results...sorry. try another question')
	}
}).catch(console.error);



const queryAssumption = (msg, assumptiom) => {
	waApi.getFull({
	  input: msg,
	  includepodid: 'Result',
	  assumptiom: assumptiom,
	  output: 'json',
	}).then((queryresult) => {
		console.log(queryresult)
		if(queryresult && queryresult.success) {
			if(queryresult.assumptions) {
				console.log(queryresult.assumptions);
			}
			console.log(queryresult.pods[0])
	  		console.log(queryresult.pods[0].subpods[0].plaintext);
		} else{
			console.log('no results...sorry. try another question')
		}
	}).catch(console.error);
}