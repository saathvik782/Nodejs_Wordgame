var config = require('config');
module.exports = {
    puzzle : [],
    
    words : [],
    
    generatePuzzle : function(){
        var minimumNoOfWords=config.get('wordGame.minimumWords');
        var puzzleSize=config.get('wordGame.puzzleSize');
        var numerOfWords = Math.floor((Math.random() * 5) + minimumNoOfWords); 
        //TODO: generate numberOfWords words

        var puzzle_=[]
        for(var i=0;i<puzzleSize;i++){
            var t=[];
            for(var j=0;j<puzzleSize;j++){
                t.push('!');
            }
            puzzle_.push(t);
        }
        
        var pos=0; //0-row,1-col,2-diag
        var i=0;
        while( i < words.length ){
            var row_no = Math.floor((Math.random() * (puzzleSize-1)) + 0); 
            var col_no = Math.floor((Math.random() * (puzzleSize-1)) + 0); 
            var j;
            while( j == i)
                j=Math.floor((Math.random() * words.length) + 0);

            pos=Math.floor((Math.random() * 2) + 0); //0-row,1-col,2-diag
            if(words[i][0] in words[j]){
                //TODO: attach to a prev word
            }else{
                //TODO: attach to not other prev word
            }
            i++;
        }

        //this.words=["abc","aaaa","abcd","abcde"];
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
        //this.puzzle.push("abcdefghijklmno")
                
        return this.puzzle;
    },
    
    getWords : function(){
        return this.words;
    },

    getWordsDiff : function(w1,w2){
        
    }
};
