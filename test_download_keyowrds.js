const request = require('request');

let KEYWORDS = [];

request('https://gist.githubusercontent.com/fcavalcantirj/237cb46bc044e89f9df5ac04ae769a13/raw/8753087e01b96334dd0f7dfec0caeee1f4f22d20/keywords_aroudo_bot.json', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(res.toJSON().body.keywords)
  const json = res.toJSON();
  // console.log(res.toJSON().body.keywords)
  if(json && json.body && json.body.keywords) {
  	const _words = json.body.keywords;
  	// console.log('_words=' + _words);
  	console.log('found ' + _words.length + ' words');
  	KEYWORDS = _words;
  }
});