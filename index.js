/*
 *  whip-o-matic - Twitter bot that tweets random phrases from a
 *                 Wesley Willis lyric inspired corpus while making
 *                 friends and going on harmony joyrides
 */

var Bot = require('./lib/bot'),
    config = require('./etc/config'),
    corpus = require('./var/corpus'),
    sentences = require('./var/sentences'),
    regex = /./,
    adjective = /\b(a)\b(\s+)?(((<[^>]+>)\s?)+)?(\s+)?([aeiou]|hou)/gim,
    vowel = /\b(a)\b(\s+)?(((<[^>]+>)\s?)+)?(\s+)?([aeiou]|hou)/gim;

var bot = new Bot(config);

console.log('[i] whip-o-matic ready to whip a lemur\'s ass...');

var initialize = function initialize() {
	regex = generateRegExp();
	rawPhrase = generatePhrase();
  return rawPhrase;
};

var generateRegExp = function generateRegExp() {

	var str = '';
	var arr = [];
	var tmp = "@(types)";

	for(type in corpus) {
		arr.push(type);
	}

	var exp = tmp.replace("types", arr.join('|'));

	return new RegExp(exp, "ig");
}

// Generate a joyous phrase ride
function generatePhrase() {

	var type;
	var match;
	var index;
	var intro;
	var output;

	var template = sentences.templates[(Math.random() * sentences.templates.length) | 0];

	var data = {};

	for(var prop in corpus) {

		data[prop] = corpus[prop].concat();
	}

	var result = regex.exec(template);

	while(result) {

		type = result[1];
		match = result[0];

		index = (Math.random() * data[type].length) | 0;
		template = template.replace(match, data[type].splice(index, 1)[0]);

		regex.lastIndex = 0;
		result = regex.exec(template);
	}

	output = template;

	return correctGrammar(output);
}

// Correct grammar
function correctGrammar(input) {

	// Change 'a' to 'an' when before an adjective
	input = input.replace(adjective, "$1n$2$3$6$7");

	// Change 'a' to 'an' when before a vowel
	input = input.replace(vowel, "$1n$2$3$6$7");

  // Drop "'s" off nouns ending in "s"
  input = input.replace("s\'s", "s\'");
	return input;
}

// Get date string for today's date (e.g. '2014-02-18')
function datestring () {
  var d = new Date(Date.now() - 5*60*60*1000);  //EST timezone
  return d.getUTCFullYear()   + '-'
     +  (d.getUTCMonth() + 1) + '-'
     +   d.getDate();
};

// TootLoop
setInterval(function() {
  bot.twit.get('followers/ids', function(err, reply) {
    if(err) return handleError(err)
    console.log('[i] Followers: ' + reply.ids.length.toString());
  });
  var rand = Math.random();

  //  Toot a phrase
  if(rand <= 0.05) {

      var phrase = initialize();

      bot.tweet(phrase, function (err, reply) {
        if(err) return handleError(err);

        console.log('[+] Tweet: ' + (reply ? reply.text : reply));
    });

  } else if(rand <= 0.01) { //  Make a friend
    bot.mingle(function(err, reply) {
      if(err) return handleError(err);

      var name = reply.screen_name;
      console.log('[+] Mingle: followed @' + name);
    });
  } else {                  //  Prune a friend
    bot.prune(function(err, reply) {
      if(err) return handleError(err);

      var name = reply.screen_name
      console.log('[-] Prune: unfollowed @'+ name);
    });
  }
}, 10000);

function handleError(err) {
  console.error('[!] Response status:', err.statusCode);
  console.error('[!] Error data:', err);
}

