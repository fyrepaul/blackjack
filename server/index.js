const http = require('http'),
      SocketIO = require('socket.io'),
      { BlackJackGame } = require('../client/games/blackjack'),
      { Player } = require('../client/player.js');

const PORT = 8085;

var app = http.createServer(function(request, response){}),
    io = SocketIO(app),
    game = new BlackJackGame();

// connection event
io.on('connection', function (client) {
  console.log('User connected!');

  var player = game.createNewPlayer();

  client.on('chat_message', function(data) {
    try {
      client.broadcast.emit('chat_message', data);
      // new player just joined game
    } catch (e) {
      console.error(e);
    }
  });
  console.log(game);
  // client.emit('connection', {
  //   game: 'BlackJackGame',
  //   _opts: {
  //     value: '',
  //     suit: ''
  //   }
  // });

});

app.listen(PORT);
