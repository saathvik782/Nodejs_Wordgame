var w = require('./test');
var config = require('config');
var util = require('./util');
var a = {
    puzzle : [],

    puzzle_:[],
    
    words : [],
    
    minimumNoOfWords : config.get('wordGame.minimumWords'),
    //minimumNoOfWords : 10,
    
    //puzzleSize : 15,
    puzzleSize : config.get('wordGame.puzzleSize'),
    
    generatePuzzle : function(w){
        //var numerOfWords = Math.floor((Math.random() * 5) + this.minimumNoOfWords); 
        var numerOfWords = 10; 
        var i;
        var wordsPosition={};
        var pos_found;
        for (var j=0;j<this.puzzleSize;j++){
            var t=[];
            for (var k=0;k<this.puzzleSize;k++)
                t.push(' ');
            this.puzzle_.push(t);
        }
        
        //TODO: generate numberOfWords words
        //this.words = ["sheep","goat","pig","chicken","rabbit"];
        this.words = this.generateWords(w,numerOfWords);
        wordsFinished = [" "]; 

        i=0;
        console.log('Starting puzzle generation for '+this.words+'..');
        while( i < this.words.length ){
            console.log('->Present word is - '+this.words[i]);
            pos_found=false;
            while(!pos_found){
                var j=i;
                var row_no,col_no;
                var pos=Math.floor((Math.random() * 3) + 0); //0-row,1-col,2-diag
                var directionj=0; //0-up.1-down
                var directioni=0; //0-up.1-down
                var word_length = this.words[i].length;
                while( i!=0 & j == i)
                    j=Math.floor((Math.random() * wordsFinished.length) + 0);
                
                console.log('-->prev word choosen is '+this.words[j]);
                //get a col_no and row_no to work with
                if(i!=0 & (wordsFinished[j].indexOf(this.words[i][0]) > -1)){
                    console.log('-->trying to attach to word '+this.words[j]);
                    //attach to a prev word
                    var wp=wordsPosition[wordsFinished[j]];
                    var l=wp.start.i,
                        m=wp.start.j,
                        n=wp.end.i,
                        o=wp.end.j;

                    for(;l<n;l++)
                        for(;m<o;m++)
                            if(this.puzzle_[l][m] == this.words[i][0]){
                                row_no=l;
                                col_no=m;
                            }
                }else{
                    //attach to not other prev word
                    row_no = Math.floor((Math.random() * (this.puzzleSize-1)) + 0); 
                    col_no = Math.floor((Math.random() * (this.puzzleSize-1)) + 0); 
                }
                console.log('-->trying to put at position  '+row_no+' '+col_no);
                
                var endi,endj;
                //Do the main assignment work here
                switch(pos){
                        case 0:
                            directionj=Math.floor((Math.random() * 2) + 0); //0-towards right.1-towards leftg
                            directionj=0;
                            if(directionj == 1){
                                endi=row_no;
                                endj=col_no-word_length+1;
                            }else{
                                endi=row_no;
                                endj=col_no+word_length-1;
                            }
                            break;
                        case 1:
                            directioni=Math.floor((Math.random() * 2) + 0); //0-towards right.1-towards leftg
                            directioni=0;
                            if(directioni == 1){
                                endi=row_no-word_length+1;
                                endj=col_no;
                            }else{
                                endi=row_no+word_length-1;
                                endj=col_no;
                            }
                            break;
                        case 2:
                            directionj=Math.floor((Math.random() * 2) + 0); //0-towards right.1-towards leftg
                            directioni=Math.floor((Math.random() * 2) + 0); //0-up.1-down
                            directionj=0;
                            if(directionj == 1){
                                if(directioni == 1){
                                    endi=row_no-word_length+1;
                                    endj=col_no-word_length+1;
                                }else{
                                    endi=row_no+word_length-1;
                                    endj=col_no-word_length+1;
                                }
                            }else{
                                if(directioni == 1){
                                    endi=row_no-word_length+1;
                                    endj=col_no+word_length-1;
                                }else{
                                    endi=row_no+word_length-1;
                                    endj=col_no+word_length-1;
                                }
                            }
                            break;
                };
                //console.log('-->pos is '+pos+' direction is '+directionj+' '+directioni);
                
                //copt the word into position if possible
                if(!this.isPosTaken(directionj,directioni,pos,row_no,col_no,endi,endj)){
                    console.log('-->position availabe');
                    this.copyInPosition(this.words[i],directionj,directioni,pos,row_no,col_no,endi,endj);
                    wordsPosition[this.words[i]]={
                        'start':{
                            'i':row_no,
                            'j':col_no
                        },
                        'end':{
                            'i':endi,
                            'j':endj
                        }
                    };
                    wordsFinished.push(this.words[i]);
                    pos_found=true;
                }
            }
            console.log('->word done..');
            i++;
        }
        
        console.log(this.puzzle_);
        console.log(this.words);
        this.fillRemaining(); 
        this.generatePuzzleFromPuzzle_();
        return this.puzzle;
    },
    
    isPosTaken : function(directionj,directioni,pos,i,j,endi,endj){
        //console.log(directionj+ ' ' +directioni);
        //console.log(i+' '+j+' '+endi+' '+endj);
        
        if(directioni == 1){
            if(directionj == 1){
                if(endi<0 || endj<0)
                    return true;
            }else{
                if(endi<0 || endj>this.puzzleSize-1)
                    return true;
            }
        }else{
            if(directionj == 1){
                if(endi>this.puzzleSize-1 || endj<0)
                    return true;
            }else{
                if(endi>this.puzzleSize-1 || endj>this.puzzleSize-1)
                    return true;
            }
        }
        
        if(pos < 2){
            for(var l=i;(directioni < 1) ? (l<=endi):(l>=endi);(directioni < 1) ? l++:l--){
                for(var m=j;(directionj < 1) ? (m<=endj):(m>=endj);(directionj < 1) ? m++:m--){
                    if(this.puzzle_[l][m] != ' ')
                        return true;
                }
            }
        }else{
            for(var l=i,m=j;((directioni < 1) ? (l<=endi):(l>=endi))&&((directionj < 1) ? (m<=endj):(m>=endj));(directioni < 1) ? l++:l--,(directionj < 1) ? m++:m--){
                    //console.log('diag '+l+' '+m);
                    if(this.puzzle_[l][m] != ' ')
                        return true;
            }
        }
        
        return false;
    },

    copyInPosition: function(word,directionj,directioni,pos,i,j,endi,endj){
        var n=0;
        //console.log(directionj+ ' ' +directioni);
        //console.log(i+' '+j+' '+endi+' '+endj);
        
        if(pos < 2){
            for(var l=i;(directioni < 1) ? (l<=endi):(l>=endi);(directioni < 1) ? l++:l--){
                for(var m=j;(directionj < 1) ? (m<=endj):(m>=endj);(directionj < 1) ? m++:m--){
                    this.puzzle_[l][m]=word[n];
                    //console.log(l+' '+m+' '+word[n]);
                    n++;
                }
            }
        }else{
            for(var l=i,m=j;((directioni < 1) ? (l<=endi):(l>=endi))&&((directionj < 1) ? (m<=endj):(m>=endj));(directioni < 1) ? l++:l--,(directionj < 1) ? m++:m--){
                    this.puzzle_[l][m]=word[n];
                    //console.log(l+' '+m+' '+word[n]);
                    n++;            
            }
        }

        //console.log(this.puzzle_);
    },

    getWords : function(){
        return this.words;
    },

    fillRemaining : function(){
        for(var i=0;i<this.puzzleSize;i++)
            for(var j=0;j<this.puzzleSize;j++){
                if(this.puzzle_[i][j] == ' '){
                    var letter=util.randomLetter();
                    this.puzzle_[i][j]=letter;
                }
            }
    },

    generatePuzzleFromPuzzle_ : function(){
        for(var i=0;i<this.puzzleSize;i++){
            var  t="";
            for(var j=0;j<this.puzzleSize;j++){
                t+=this.puzzle_[i][j];
            }
            this.puzzle.push(t);
        }
    },

    generateWords: function(w,length){
        console.log('Generating words...');
        var data_;
        var generatedWords=[];
        while(length > 0){
             var index=Math.floor((Math.random() * (w.length)) + 0);
             var word=w[index].replace(/\W/g,"").toLowerCase();
             if( word.length<15 & generatedWords.indexOf(word) == -1){
                 generatedWords.push(word);
                 length--;
             }
         }
        console.log('words generated');
        return generatedWords;
    }
};
module.exports = a;
//a.generatePuzzle(w);
//console.log(a.getWords());
