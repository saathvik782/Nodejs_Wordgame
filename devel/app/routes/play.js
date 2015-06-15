var express = require('express');
var util = require('../config/util.js');
var router = express.Router();

//router.get('/', function(req, res) {
//    res.render('partials/play', {
//        title: 'Word game',
//        user: req.user,
//        isPlayPage: true
//    });
//});

router.post('/', function(req, res) {
    var user = req.body.user; 
    var token;
    if(!req.body.token)
        token=util.randomString(20);
    else
        token=req.body.token;
    res.redirect('/game/' + token + '/' + user);
});

module.exports = router;
