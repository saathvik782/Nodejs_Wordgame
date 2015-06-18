var fs = require('fs');
console.log("Words loading...");
var words=fs.readFileSync('/usr/share/dict/words').toString().split("\n");
console.log("Words loaded !");
module.exports=words;
