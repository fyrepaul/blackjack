// We need to require dust first since it sets and uses a global
const dust = global.dust = require('dustjs-linkedin'),
      dustHelpers = require('dustjs-helpers'),
      extraDustHelpers = require('./custom-dust-helpers'),
      SocketIO = require('socket.io-client'),
      { DOMRenderer } = require('./dom-renderer'),
      { BlackJackGame } = require('./games/blackjack'),
      { Player } = require('./player'),
      { Card } = require('./card'),
      { renderCard } = require('./debug-utils');

(function() {

  // console.log('KingTut: ', BlackJackGame);
  // var game = global.game = new BlackJackGame({
  //   renderer: new DOMRenderer('root')
  // });

  // var testPlayers = 5,
  //     cardsPerHand = 5;

  // for (var i = 0; i < testPlayers; i++) {
  //   var player = new Player(this);
  //   game.addPlayer(player);

  //   for (var j = 0; j < cardsPerHand; j++)
  //     game.addRandomCardToHand(player);
  // }

  function initializeWebsocketConnection(host, port) {
    // Attach to the WebSocket
    const socket = SocketIO(`http://${host}:${port}`),
          self = this;

    socket.on('connection', function(gameData) {

      console.log('Connected to websocket server!', gameData);
      gameData.webSocket = this;
      gameData.renderer = new DOMRenderer('root');
      var game = global.game = new BlackJackGame(gameData);
      game.render();
    });
  }
  initializeWebsocketConnection('localhost', 8085);

  //game.render();
})();
