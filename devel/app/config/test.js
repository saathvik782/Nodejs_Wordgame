var config = require('config');

var fs = require('fs');
console.log("Words loading...");
var words=fs.readFileSync(config.get('wordGame.wordFilePath')).toString().split("\n");
console.log("Words loaded !");
module.exports=words;
