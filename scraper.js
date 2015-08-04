var request = require('request');
var cheerio = require('cheerio');
var urlfetch = require('./urlfetch');
var decay = require('decay');
var wilsonScore = decay.wilsonScore();

var steamIds = urlfetch.getSteamIds();
var kickstarterURLs = urlfetch.getKickstarterURLs();


var results = [];

for(var i = 0; i < kickstarterURLs.length; i++) {
  request(kickstarterURLs[i], ( function (i) {
    return function(err, response, body) {
      if (err) {
        throw err;
      }
      $ = cheerio.load(body);
      var headerData = $('.mobile-hide.py4.px2').find('a');
      var backersData = $('#backers_count').text();
      backersData = backersData.replace(/\,/g, '');
      backersData = parseInt(backersData, 10);
      var pledgedData = $('#pledged').text();
      pledgedData = pledgedData.replace(/\$|,/g, '');
      pledgedData = parseInt(pledgedData, 10);
      var goalData = $('.money.usd.no-code').text();
      goalData = goalData.replace(/\$|,/g, '');
      goalData = parseInt(goalData, 10);

      var objHolder = {
        title : $(headerData[0]).text(),
        studio : $(headerData[1]).text(),
        backers : backersData,
        pledged : pledgedData,
        goal : goalData
      };
      request('http://store.steampowered.com/app/' + steamIds[i] + '/', function (err, response, body) {
        if (err) {
          throw err;
        }
        $ = cheerio.load(body);
        var positiveReviews = $('#ReviewsTab_positive .user_reviews_count').text();
        positiveReviews = positiveReviews.replace(/\(|\)|,/g, '');
        positiveReviews = parseInt(positiveReviews, 10);
        var negativeReviews = $('#ReviewsTab_negative .user_reviews_count').text();
        negativeReviews = negativeReviews.replace(/\(|\)|,/g, '');
        negativeReviews = parseInt(negativeReviews, 10);
        var scoreData = wilsonScore(positiveReviews, negativeReviews);
        objHolder.score = scoreData;
        objHolder.totalReviews = positiveReviews + negativeReviews;

        request('http://store.steampowered.com/widget/' + steamIds[i] + '/', function (err, response, body) {
          if (err) {
            throw err;
          }
          $ = cheerio.load(body);
          var descriptionData = String($('.desc').text());
          descriptionData = descriptionData.replace(/\\r|\\n|\\t/g, '');
          var bannerImgData = $('.desc img').attr('src');
          objHolder.description = descriptionData;
          objHolder.bannerImgData = bannerImgData;
          results.push(objHolder);
          //console.log(JSON.stringify(objHolder));
        });
      });
    }
  } )(i));
}

var timeCheck = setInterval(function () {
  if(results.length == steamIds.length && results[results.length-1].score != null) {
    console.log(JSON.stringify(results));
    stopCheck();
  } else {
    console.log("checking");
  }
}, 3000);

function stopCheck() {
  clearInterval(timeCheck);
}
