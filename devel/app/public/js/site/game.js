//This will be the utimate ai that calibrates and tinkers everything
$(document).on('ready',function(){
    var socket=io();
    
    var wordSoFar=[];
    var idSoFar=[];
    var token,user,colour;
    token=$('#mainScreen').attr('data-token'); 
    user=$('#mainScreen').attr('data-user'); 
    
    //First event that is emitted once a game screen loads 
    socket.emit('join',{
        //Sending user name and token as data
        'token':token,
        'name':user
    });

    socket.on('wait',function(data){
        displayOnMainScreen(data);
    });
    
    socket.on('missed',function(data){
        displayOnMainScreen(data);
    });
    
    socket.on('waiting-for-more-players',function(data){
        displayOnMainScreen(data);
        if(data.root == user){
            data.time_remaining--;
            socket.emit('time-remaining',data);
        }
    });

    socket.on('start',function(data){
        displayOnSideScreenL(data);
        colour=data.player_info[user].colour;
        $('#colouredUserName').css('background-color', colour);
        $('#mainScreen').html('');
        for(var i=0;i<data.puzzle.length;i++){
            for(var j=0;j<data.puzzle[i].length;j++){
                $('#mainScreen').append('<button class="btn btn-success disabled letter" data-letter="'+data.puzzle[i][j] +'" id="'+(String(i)+String(j))+'">'+data.puzzle[i][j]+'</button>');
            }
            $('#mainScreen').append('<br/>')
        }
        
        $('.letter').on('click',function(e){
            socket.emit('new-click',{
                'token':token,
                'name':user,
                'colour':colour,
                'id':e.target.id
            });

            wordSoFar.push($(this).attr('data-letter'));
            idSoFar.push(e.target.id);
        });
    });
    
    $(document).bind('keypress',function(e){
        var code = e.keyCode || e.which;
        if(code == 13) { //Enter keycode
            e.preventDefault();
            var word="";
            for(var i=0;i<wordSoFar.length;i++)
                word+=wordSoFar[i];
            if(word == "")
                return;
            socket.emit('new-enter',{
                'token':token,
                'name':user,
                'colour':colour,
                'word':word
            });
        }
    });

    socket.on('new-click',function(data){
        //highlight the correct element
        $('#'+data.id).removeClass("btn-success");
        $('#'+data.id).addClass("btn-warning");
    });
    
    socket.on('new-turn',function(data){
        $('.letter').removeClass('btn-warning');
        $('.letter').addClass('btn-success');
        wordSoFar=[];
        idSoFar=[];
        //if not your turn make all words unclickable
        if(data.name == user)
            releaseTheLettersAndPass();
        else
            cageTheLettersAndPass();
    });
     
    socket.on('new-enter',function(data){
        displayOnSideScreenR(data);
    });   
    socket.on('player-passed',function(data){
        displayOnSideScreenR(data);
    });
    
    socket.on('player-joined',function(data){
        displayOnSideScreenR(data);
    });

    
    socket.on('player-disconnected',function(data){
        displayOnSideScreenR(data);
    });
    
    socket.on('abort',function(data){
        displayOnMainScreen(data);
    });
    
    function displayOnMainScreen(data){
        console.log(data);
        $('#mainScreen').text(data.display_data);
    };

    function displayOnSideScreenR(data){
        console.log(data);
        $('#sideScreenR').append("<font color="+data.colour+">"+data.display_data+"</font><br/>");
    };
    
    function displayOnSideScreenL(data){
        console.log(data);
        for (var each in data.player_info)
            $('#sideScreenL').append("<font color="+data.player_info[each].colour+">"+each+" : "+data.player_info[each].score+"</font><br/>");
    };

    function releaseTheLettersAndPass(){
        $('.letter').removeClass('disabled');
        $('.letter').addClass('enabled');
        $('#gamePassButton').removeClass('disabled');
        $('#gamePassButton').addClass('enabled');
    };
    
    function cageTheLettersAndPass(){
        $('.letter').removeClass('enabled');
        $('.letter').addClass('disabled');
        $('#gamePassButton').removeClass('enabled');
        $('#gamePassButton').addClass('disabled');
    };

});
