const stringSimilarity = require('string-similarity');

let KEYWORDS = [
'facebook', 'evento', 'foda', 'maconha', 'vakinha', 'promocao', 'noitada', 'gostosa', 'mulher', 'gata', 'gatinha',
'cortejo', 'orienta', 'orientacao'
];

const JAROL_THRESHOLD = 0.89;

const JaroWrinker = (s1, s2) => {
        var m = 0;

        // Exit early if either are empty.
        if ( s1.length === 0 || s2.length === 0 ) {
            return 0;
        }

        // Exit early if they're an exact match.
        if ( s1 === s2 ) {
            return 1;
        }

        var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
            s1Matches = new Array(s1.length),
            s2Matches = new Array(s2.length);

        for ( i = 0; i < s1.length; i++ ) {
            var low  = (i >= range) ? i - range : 0,
                high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

            for ( j = low; j <= high; j++ ) {
            if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
                ++m;
                s1Matches[i] = s2Matches[j] = true;
                break;
            }
            }
        }

        // Exit early if no matches were found.
        if ( m === 0 ) {
            return 0;
        }

        // Count the transpositions.
        var k = n_trans = 0;

        for ( i = 0; i < s1.length; i++ ) {
            if ( s1Matches[i] === true ) {
            for ( j = k; j < s2.length; j++ ) {
                if ( s2Matches[j] === true ) {
                k = j + 1;
                break;
                }
            }

            if ( s1[i] !== s2[j] ) {
                ++n_trans;
            }
            }
        }

        var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
            l      = 0,
            p      = 0.1;

        if ( weight > 0.7 ) {
            while ( s1[l] === s2[l] && l < 4 ) {
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
			const jarolDistance = JaroWrinker(k, p);
			// console.log('jarolDistance=' + jarolDistance);
			if(jarolDistance > JAROL_THRESHOLD) {
				console.log('MATCH##### k=[' + k + '] and p=[' + p + ']');
				return p;
			}
		}
	}
	return undefined;
}

const phrase = 'Frase maconha taliba mal escrita levenstein de cu é rola!';

console.log(check_existence_jaro(phrase, KEYWORDS));

// for (var idz = 0; idz < phrase_splited.length; idz++) {
// 	const p = phrase_splited[idz];
// 	// console.log('p=' + p);
// 	for (var idx = 0; idx < keywords.length; idx++) {
// 		const k = keywords[idx];
// 		// console.log(k);
// 		// console.log('k=[' + k + '] and p=[' + p + ']');
// 		const jarolDistance = JaroWrinker(k, p);
// 		// console.log('jarolDistance=' + jarolDistance);
// 		if(jarolDistance > JAROL_THRESHOLD) {
// 			console.log('MATCH##### k=[' + k + '] and p=[' + p + ']');
// 			break;
// 		}
// 	}
// }


// console.log(stringSimilarity.findBestMatch(phrase, keywords));
// console.log(JaroWrinker('gretinha', 'gatinha'))