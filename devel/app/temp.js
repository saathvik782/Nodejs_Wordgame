
    socket.on('start',function(data){
        displayOnSideScreenL(data);
        colour=data.player_info[user].colour;
        $('#colouredUserName').css('background-color', colour);
        $('#mainScreen').html('');
        gridSize=data.puzzle.length;
        $('#mainScreen').append('<table class="table table-bordered"><tbody></tbody></table>');
        for(var i=0;i<data.puzzle.length;i++){
            $('#mainScreen > table > tbody').append('<tr id="'+i+'-tr"><tr/>')
            for(var j=0;j<data.puzzle[i].length;j++){
                //$('#mainScreen').append('<button class="btn btn-success disabled letter" data-i="'+i+'" data-j="'+j+'" data-letter="'+data.puzzle[i][j] +'" id="'+i+'-'+j+'">'+data.puzzle[i][j]+'</button> ');
                $('#mainScreen > table > tbody > #'+i+'-tr').append('<td class="success letter" data-i="'+i+'" data-j="'+j+'" data-letter="'+data.puzzle[i][j] +'" id="'+i+'-'+j+'">'+data.puzzle[i][j]+'</td>');
            }
        }
        


socket.on('new-click',function(data){
    displayOnSideScreenL(data);
    displayOnSideScreenR(data);
    //highlight the correct element
    for(var each in data.id_list){
        if(data.action == 'mark'){
            $('#'+data.id_list[each]).removeClass("btn-success");
            $('#'+data.id_list[each]).addClass("btn-warning");
        }
        else if(data.action == 'unmark'){
            $('#'+data.id_list[each]).removeClass("btn-warning");
            $('#'+data.id_list[each]).addClass("btn-success");
        }
    }
});

    socket.on('new-turn',function(data){
        displayOnSideScreenL(data);
        $('.letter').removeClass('btn-warning');
        $('.letter').addClass('btn-success');
        wordSoFar=[];
        idSoFar=[];
        //if not your turn make all words unclickable
        if(data.name == user){
            releaseTheLettersAndPass();
            displayOnSideScreenR(data);
        }
        else
            cageTheLettersAndPass();
    });
    
    function clearAllLetters(){
        $('.letter').removeClass('btn-warning');
        $('.letter').addClass('btn-success');
    };


