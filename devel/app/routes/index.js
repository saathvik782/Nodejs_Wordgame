var express = require('express');
var util = require('../config/util.js');

var router = express.Router();

router.get('/', function(req, res) {
   //mongoose.model('Quote').find({}, function(err, quotes) {
   //     var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
   //     mongoose.model('Puzzle').find({}, function(err, puzzles) {
   //        var randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
   //        var logoutSuccessMessage = req.flash('logoutSuccess');
   //        var welcomeMessage = req.flash('welcomeMessage');
   //        var registerSuccessMessage = req.flash('registerSuccessMessage');
   //        res.render('partials/index', {
   //            title: 'Chess Hub',
   //            quote: randomQuote,
   //            puzzle: randomPuzzle,
   //            logoutSuccessMessage: logoutSuccessMessage,
   //            welcomeMessage: welcomeMessage,
   //            registerSuccessMessage: registerSuccessMessage,
   //            user: req.user,
   //            isHomePage: true
   //        });
   //    });
   // });
    res.render('partials/index',{
        footer_title:" How to start ?",
        footer_content:" You can join and exiting game - click 'Join' with the correct code as input, You can start a new game by clicking 'New-Game'"
    });
});

router.get('/game/:token/:user', function(req, res) {
    var token = req.params.token;
    var user = req.params.user;
    //res.render('partials/game', {
    //    title: 'Word Game ' + token,
    //    user: user,
    //    isPlayPage: true,
    //    token: token
    //});
});

module.exports = router;
