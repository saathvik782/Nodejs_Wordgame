//This will be the utimate ai that calibrates and tinkers everything
$(document).on('ready',function(){
    var socket=io();
    
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
        $('#mainScreen').innerHTML('');
        //for(int i=0;i<data.puzzle.length;i++){
        //    for(int j=0;j<data.puzzle[i].length;j++){
        //        $('#mainScreen').append('<button class="btn btn-success disabled letter" data-letter="'+data.puzzle[i][j] +'">'+data.puzzle[i][j]+'</button>');
        //    }
        //    $('#mainScreen').append('<br/>')
        //}
    });

    socket.on('new-click',function(data){
        //TODO: highlight the correct element
    });
    
    socket.on('new-turn',function(data){
        //TODO: if not your turn make all words unclickable
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
});
