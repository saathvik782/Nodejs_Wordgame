var express = require('express');
var util = require('../config/util.js');
var router = express.Router();

router.post('/', function(req, res) {
    var user = req.body.user; 
    var token;
    if("key" in req.body)
        token=req.body.key;
    else
        token=util.randomString(20);
    res.redirect('/game/' + token + '/' + user);
});

module.exports = router;
