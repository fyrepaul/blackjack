// We need to require dust first since it sets and uses a global
const dust = global.dust = require('dustjs'),
      dustHelpers = require('dustjs-helpers');

      // Include websocket connector
const { initializeWebsocketConnection } = require('./websockets'),
      // Include game classes
      { DOMRenderer } = require('./dom-renderer'),
      { BlackJackGame } = require('./games/blackjack'),
      { Card } = require('./card'),
      { renderCard } = require('./debug-utils');

(function() {
  // Start websocket connection to server
  //initializeWebsocketConnection('localhost', 8085);

  console.log('KingTut: ', BlackJackGame);
  global.game = new BlackJackGame(new DOMRenderer('root'));
})();