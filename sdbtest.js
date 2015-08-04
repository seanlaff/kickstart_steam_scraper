var request = require('request');
var cheerio = require('cheerio');

request('https://steamdb.info/app/212680/graphs/', function(err, response, body) {
    if (err) {
      throw err;
    } else {
      console.log(body);
    }
  });
