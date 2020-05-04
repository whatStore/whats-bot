// Supports ES6
// import { create, Whatsapp } from 'sulla';
const dotenv = require('dotenv');
dotenv.config();

const sulla = require('sulla');
const request = require('request');
const WolframAlphaAPI = require('@dguttman/wolfram-alpha-api');


const waApi = WolframAlphaAPI('23G8YJ-WG8RA742Q6');

// In case of being logged out of whatsapp web
// Force it to keep the current session
// State change
const KEEP_LOGGED = true;

// telegram stuff
const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if(!TELEGRAM_CHAT_ID || !TELEGRAM_CHAT_ID
	|| TELEGRAM_CHAT_ID == '' || TELEGRAM_API_KEY == '') {
	console.log('MISSING ENV VARS.... .env file missing or missing vars=[TELEGRAM_API_KEY, TELEGRAM_CHAT_ID]');
	process.exit(1);
}

const URL = 'https://api.telegram.org/'+TELEGRAM_API_KEY+'/sendMessage?chat_id='+TELEGRAM_CHAT_ID+'&text=';
const BOT_API_KEY = '1223381492:AAH7PzsPXlZJW91MXWQbQ3cb8i10X3OKcDo';
const PRIVATE_CHANNEL_ID = '-1001326333548';
// end telegram stuff

// GIST to get keywords json
const _GIST_URL = 'https://gist.githubusercontent.com/fcavalcantirj/237cb46bc044e89f9df5ac04ae769a13/raw/d318c284888b5bf21c5f344381eb76b9a63ff38e/keywords_aroudo_bot.json';

// keywords, jarolWrinker threashold
let _KEYWORDS = [];
const JAROL_THRESHOLD = 0.89;

const fetchKeywords = () => {
	console.log('fetchKeywords...');
	request(_GIST_URL, { json: true }, (err, res, body) => {
	  if (err) { return console.log(err); }
	  const json = res.toJSON();
	  if(json && json.body && json.body.keywords) {
	  	const _words = json.body.keywords;
	  	_KEYWORDS = _words;
	  	console.log('found ' + _KEYWORDS.length + ' words with words=[' + _KEYWORDS + ']');
	  }
	});
}
// return JaroWrinker 'weight'
const JaroWrinker = (s1, s2) => {
	var m = 0;

	// Exit early if either are empty.
	if (s1.length === 0 || s2.length === 0) {
		return 0;
	}

	// Exit early if they're an exact match.
	if (s1 === s2) {
		return 1;
	}

	var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
		s1Matches = new Array(s1.length),
		s2Matches = new Array(s2.length);

	for (i = 0; i < s1.length; i++) {
		var low = (i >= range) ? i - range : 0,
			high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

		for (j = low; j <= high; j++) {
			if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
				++m;
				s1Matches[i] = s2Matches[j] = true;
				break;
			}
		}
	}

	// Exit early if no matches were found.
	if (m === 0) {
		return 0;
	}

	// Count the transpositions.
	var k = n_trans = 0;

	for (i = 0; i < s1.length; i++) {
		if (s1Matches[i] === true) {
			for (j = k; j < s2.length; j++) {
				if (s2Matches[j] === true) {
					k = j + 1;
					break;
				}
			}
			if (s1[i] !== s2[j]) {
				++n_trans;
			}
		}
	}
	var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
		l = 0,
		p = 0.1;

	if (weight > 0.7) {
		while (s1[l] === s2[l] && l < 4) {
			++l;
		}
		weight = weight + l * p * (1 - weight);
	}
	return weight;
}

const check_existence_jaro = (phrase, keywords) => {
	if(!phrase) return false;
	const phrase_splited = phrase.split(' ');
	for (var idz = 0; idz < phrase_splited.length; idz++) {
		const p = phrase_splited[idz];
		// console.log('p=' + p);
		for (var idx = 0; idx < keywords.length; idx++) {
			const k = keywords[idx];
			// console.log(k);
			// console.log('k=[' + k + '] and p=[' + p + ']');
			const jarolDistance = JaroWrinker(k.toLowerCase(), p.toLowerCase());
			// console.log('jarolDistance=' + jarolDistance);
			if(jarolDistance >= JAROL_THRESHOLD) {
				console.log('MATCH##### k=[' + k + '] and p=[' + p + ']');
				return p.toLowerCase();
			}
		}
	}
	return undefined;
}
// END CONTENT JaroWrinker

function sendContent(content) {
	const urlEncodedMsg = encodeURIComponent(content);
	console.log('sending urlEncodedMsg:' +  urlEncodedMsg);
	request(URL+urlEncodedMsg, { json: true }, (err, res, body) => {
	  if (err) { return console.log(err); }
	});
}

function start(client) {
	client.onMessage((message) => {
		// console.log(message);
		const msg = message.body;
		const author = (message.sender.name ? message.sender.name : message.sender.pushname);
		const where = message.chat.name;
		console.log('rcvdMsg=[' + msg + '] from author=[' + author + '] at [' + where + ']');
		
		const foundWord = check_existence_jaro(msg, _KEYWORDS);
		if(foundWord) {
			console.log('MATCH with keyword=[' + foundWord + ']');
			const message = '[' + msg + '] from author=[' + author + '] at [' + where + ']';
			sendContent(message);
		}

	    if (msg.toLowerCase() === 'brow') {
	      client.sendText(message.from, '✌ aqui quem fala é o brow-bot-beta ✌');
	    }

		if (msg.toLowerCase().indexOf('@time') > -1){
			client.sendText(message.from, `
				Don't you have a clock, dude?
				*${new Date()}*`);
		}

		if (msg.toLowerCase().indexOf('facebook') > -1){
			console.log('MATCH.FB');
			const message = '[' + msg + '] from author=[' + author + '] at [' + where + ']';
			sendContent(message);
		}

		if (msg.toLowerCase().indexOf('#@') > -1){
			const content = msg.substring(2);
			waApi.getFull({
			  input: content,
			  includepodid: 'Result',
			  output: 'json',
			}).then((queryresult) => {
				try{
					const answer = queryresult.pods[0].subpods[0].plaintext;
					console.log('content=[' + content + '] and answer=[' + answer + ']');
					client.sendText(message.from, '✌ brow-bot-beta ✌ = ' + answer);	  
				}catch(err){
					console.log('##### err=', err);
					client.sendText(message.from, '✌ brow-bot-beta ✌ = naaaah no luck... try another question !');
				}
			}).catch(console.error);
		}
		// fetchKeywords();
	});

	console.log('KEEP_LOGGED=' + KEEP_LOGGED);
	if(KEEP_LOGGED) {
		client.onStateChange((state) => {
		  console.log(state);
		  const conflits = [
		    sulla.SocketState.CONFLICT,
		    sulla.SocketState.UNPAIRED,
		    sulla.SocketState.UNLAUNCHED,
		  ];
		  if (conflits.includes(state)) {
		    client.useHere();
		  }
		});
	}
}


console.log('#################################### INITIALIZING BOT GROUP_CLONE ####################################');

fetchKeywords();
sulla.create('aroudo').then((client) => start(client));