var words = require('./test');
var config = require('config');
var puzzle = require('./puzzle');
module.exports = function (server) {

    
    var io = require('socket.io').listen(server);
    console.log('server started');
    var games={};
    
    /*
     * Socket IO event handlers
     */
    io.sockets.on('connection', function (socket) {

        /*
         * A player joins a game
         */
        socket.on('join', function (data) {
            var username = data.name;
            var room = data.token;
            console.log('found join event '+username+" "+room);

            // If the player is the first to join, initialize the game and players array
            if (!(room in games)) {
                var colour=randomColour();
                var players = [{
                    socket: socket,
                    name: username,
                    status: 'joined',
                    score:0,
                    colour: colour
                }];
                games[room] = {
                    room: room,
                    creator: socket,
                    status: 'waiting',
                    creationDate: Date.now(),
                    players: players,
                    colours : [colour],
                    turn : 0,
                    wordsRemaining : [],
                    wordsDone : [],
                    root : username
                };

                socket.join(room);
                socket.emit('wait',{ 
                    'display_data':'Use token: <b>'+data.token+'</b> to connect <br/> waiting for other players..',
                }); // tell the game creator to wait until a opponent joins the game
                return;
            }

            var game = games[room];
            if( game.status == 'ready'){
                socket.emit('missed',{
                    'display_data':'Game has already started :('
                });
                return;
            }

            /* TODO: handle full case, a third player attempts to join the game after already 2 players has joined the game
            if (game.status === "ready") {
                socket.emit('full');
            }*/

            socket.join(room);
            var player={};
            player.socket = socket;
            player.name = username;
            player.status = "joined";
            player.score = 0;
            var colour=randomColour();
            while(colour in game.colours){
                colour=randomColour();
            }
            player.colour = colour;
            
            game.status = "waiting";
            game.players.push(player);
            game.colours.push(colour);
             
            io.sockets.to(room).emit('waiting-for-more-players',{ 
                'token':room, 
                'time_remaining': config.get('wordGame.gameWaitTime'),
                'display_data': 'Use token: <b>'+data.token+'</b> to connect  <br/>  Game starts in '+config.get('wordGame.gameWaitTime')+' seconds',
                'root':game.root
            });
            io.sockets.to(room).emit('player-joined',{
                'display_data':username+' has joined the game',
                'colour':colour
            });
        });
        
        socket.on('time-remaining',function(data){
            if(data.time_remaining == 0){
                //TODO: Have to implement a puzzle generator
                
                var game=games[data.token]
                
                data.player_info=getPlayerInfo(game);
                data.puzzle=puzzle.generatePuzzle(words);
                game.wordsRemaining=puzzle.getWords();

                game.status='ready';
                io.sockets.to(data.token).emit('start', data);
                io.sockets.to(data.token).emit('new-turn',{
                    'name' : game.players[game.turn].name,
                    'player_info': data.player_info,
                    'display_data':' Your turn '
                });
            }
            else{
                console.log("incrementing time..");
                data.display_data='Use token: <b>'+data.token+'</b> to connect  <br/>  Game starts in '+data.time_remaining+' seconds';
                io.sockets.to(data.token).emit('waiting-for-more-players', data);

            }
        });
        
        /*
         * A player makes a new click => broadcast that move to the opponent
         */
        socket.on('new-click', function(data) {
            var game=games[data.token];
            if(data.name == game.players[game.turn].name){
                player_info={};
                for(var each in game.players){
                    //Player scores,names and colour
                    player_info[game.players[each].name]={
                        'score':game.players[each].score,
                        'colour':game.players[each].colour
                    };
                }
                data.player_info=player_info;
                io.sockets.to(data.token).emit('new-click', data);

            }
        });

        socket.on('new-enter', function(data){
            //TODO: implement checker and send appropriate response
            var room = data.token;
            var game=games[data.token];
            var display_data='';
            
            game.turn = (game.turn+1) % game.players.length;
            if (game.wordsDone.indexOf(data.word) > -1){
                display_data= data.word+' already found ';
            }
            else if(game.wordsRemaining.indexOf(data.word) > -1){
                var index=game.wordsRemaining.indexOf(data.word);
                display_data= data.name+' found '+data.word;
                game.wordsRemaining.splice(index,1);
                game.wordsDone.push(data.word);
                for(var each in game.players){
                    if(game.players[each].name == data.name)
                        game.players[each].score++;
                }
            }
            else 
                display_data= data.word+' wrong word';
            
            io.sockets.to(data.token).emit('new-enter',{
                'colour': data.colour,
                'display_data': display_data 
            });
 
            io.sockets.to(data.token).emit('new-turn',{
                'name' : game.players[game.turn].name,
                'player_info': getPlayerInfo(game),
                'display_data':' Your turn '
            })          

            if(game.wordsRemaining.length == 0){
                //Find the user with the highest score and send abort
                var winner_name="";
                var winner_colour="";
                var winner_score=0;
                var display_data="";
                for(var each in game.players)
                    if(game.players[each].score > winner_score){
                        winner_name=game.players[each].name;
                        winner_colour=game.players[each].colour;
                        winner_score=game.players[each].score;
                    }
                display_data=winner_name+' won !!!';
                for(var each in game.players)
                    if(game.players[each].score == winner_score && game.players[each].name != winner_name)
                        display_data=" It's a draw !!!";
                
                io.sockets.to(data.token).emit('abort',{
                    'display_data': display_data
                });
                return;
            }
        });

        /*
         * A player passs => notify opponent, leave game room and delete the game
         */
        socket.on('pass', function (data) {
            var room = data.token;
            if (room in games) {
                io.sockets.to(room).emit('player-passed', {
                    'colour': data.colour,
                    'display_data': data.name+' passed turn'
                });
                var game=games[room];
                game.turn = (game.turn+1) % game.players.length;
                io.sockets.to(room).emit('new-turn',{
                    'name' : game.players[game.turn].name,
                    'player_info': getPlayerInfo(game),
                    'display_data':' Your turn '
                });            
            }
        });

        /*
         * A player disconnects => notify opponent, leave game room and delete the game
         */
        socket.on('disconnect', function(data){
            for (var token in games) {
                var game = games[token];
                for (var i=0;i<game.players.length;i++) {
                    var player = game.players[i];
                    if (player.socket === socket) {
                        //If there are anymore players let them know that people have disconnected
                        socket.broadcast.to(token).emit('player-disconnected', {
                            'colour': player.colour,
                            'display_data': player.name+' disconnected'
                        });
                        game.players.splice(i,1);
                        //For handling case when all the player get disconnected 
                        //The outer if loop is to prevent any null pointer errors
                        if(game.players.length > 0){
                            if(game.players.length == 1){
                                console.log('game done');
                                game.players[0].socket.leave(token);
                                delete game;
                                socket.broadcast.to(token).emit('abort',{
                                    'display_data': 'Everyone got thrown off the ship'
                                });
                            }
                            
                            //handle if the disconnected guy has the turn
                            if(game.turn == i){
                                game.turn = (game.turn+1) % game.players.length;
                                socket.broadcast.to(token).emit('new-turn',{
                                    'name' : game.players[game.turn].name,
                                    'player_info': getPlayerInfo(game),
                                    'display_data':' Your turn '
                                });
                            }
                        }
                    }
                }
            }
        });

    });
    
    function getPlayerInfo(game){
       player_info = {};
       for(var each in game.players){
           //Player scores,names and colour
           player_info[game.players[each].name]={
               'score':game.players[each].score,
               'colour':game.players[each].colour
           };
       }
       return player_info;
    }
    /*
     * Utility function to find the player name of a given colour.
     */
    function getPlayerName(room, colour) {
        var game = games[room];
        for (var p in game.players) {
            var player = game.players[p];
            if (player.colour === colour) {
                return player.name;
            }
        }
    }
    
    function randomColour(){
        var colour='#'+Math.floor(Math.random()*16777215).toString(16);
        return colour;
    }
};
