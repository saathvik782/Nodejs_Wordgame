var config = require('config');
module.exports = function (server) {

    var io = require('socket.io').listen(server);
    var games = {};
    
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
                    root : username
                };

                socket.join(room);
                socket.emit('wait',{ 
                    'display_data': 'waiting for other players..',
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
                'display_data': 'Game starts in '+config.get('wordGame.gameWaitTime')+' seconds',
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
                
                data.player_info={};
                for(var each in game.players){
                    //Player scores,names and colour
                    data.player_info[game.players[each].name]={
                        'score':game.players[each].score,
                        'colour':game.players[each].colour
                    };
                }
                data.puzzle=[];
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                data.puzzle.push("abcdefghijklmno")
                
                game.status='ready';
                io.sockets.to(data.token).emit('start', data);
                io.sockets.to(data.token).emit('new-turn',{
                    'name' : game.players[game.turn].name
                });
            }
            else{
                console.log("incrementing time..");
                data.display_data='Game starts in '+data.time_remaining+' seconds';
                io.sockets.to(data.token).emit('waiting-for-more-players', data);

            }
        });
        
        /*
         * A player makes a new click => broadcast that move to the opponent
         */
        socket.on('new-click', function(data) {
            var game=games[data.token];
            io.sockets.to(data.token).emit('new-click', data);
        });

        socket.on('new-enter', function(data){
            //TODO: implement checker and send appropriate response
            io.sockets.to(data.token).emit('new-enter',{
                'colour': data.colour,
                'display_data': data.name+' found '+data.word
            });
            var room = data.token;
            var game=games[data.token];
            game.turn = (game.turn+1) % game.players.length;
            io.sockets.to(data.token).emit('new-turn',{
                'name' : game.players[game.turn].name
            });
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
                    'name' : game.players[game.turn].name
                });            
            }
        });

        /*
         * A player disconnects => notify opponent, leave game room and delete the game
         */
        socket.on('disconnect', function(data){
            console.log("someone disconnected");
            for (var token in games) {
                var game = games[token];
                for (var i=0;i<game.players.length;i++) {
                    var player = game.players[i];
                    if (player.socket === socket) {
                        console.log("found him "+player.colour);
                        //If there are anymore players let them know that people have disconnected
                        socket.broadcast.to(token).emit('player-disconnected', {
                            'colour': player.colour,
                            'display_data': player.name+' disconnected'
                        });
                        game.players.splice(i,1);
                        console.log("remaining "+game.players.length); 
                        //For handling case when all the player get disconnected 
                        if(game.players.length <= 1){
                            console.log('game done');
                            game.players[0].socket.leave(token);
                            delete game;
                            socket.broadcast.to(token).emit('abort',{
                                'display_data': 'Everyone got thrown off the ship'
                            });
                        }
                        console.log("remaining "+game.players.length); 
                        //For handling case when all the player get disconnected 
                        
                        //handle if the disconnected guy has the turn
                        if(game.turn == i){
                            game.turn = (game.turn+1) % game.players.length;
                            socket.broadcast.to(token).emit('new-turn',{
                                'name' : game.players[game.turn].name
                            });
                        }
                        console.log("sent data");
                    }
                }
            }
        });

    });
    
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
