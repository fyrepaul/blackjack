const dust = require('dustjs-linkedin'),
      { attrGetterSetter } = require('../common/utils');

class DOMRenderer {
  constructor(game, _opts) {
    if (!game)
      throw new Error('Game must be defined in order to create a player');

    var opts = _opts || {},
        _game = game;

    attrGetterSetter(this, 'game', () => _game, (val) => {
      _game = val;
      return val;
    });

    var rootElementID = opts.rootElementID,
        rootElement = this.rootElement = document.getElementById(rootElementID);

    if (!rootElement)
      throw new Error(`Unable to find root element: ${rootElementID}`);

    var gameRootElement = this.gameRootElement = document.createElement('div');
    gameRootElement.setAttribute('class', 'game');
    gameRootElement.setAttribute('data-game-id', game.id);

    rootElement.appendChild(gameRootElement);
  }

  destroy(){
    this.gameRootElement.parentElement.removeChild(this.gameRootElement);
  }

  querySelector(selector) {
    return this.rootElement.querySelector(selector);
  }

  querySelectorAll(selectors) {
    return this.rootElement.querySelectorAll(selectors);
  }

  isDirty(obj) {
    if (!obj)
      return true;

    if (!obj._lastUpdateTime || !obj._lastRenderTime)
      return true;

    return (obj._lastUpdateTime > obj._lastRenderTime);
  }

  renderTemplate(template, data) {
    return new Promise((resolve, reject) => {
      dust.render(template, data, function(err, output) {
        // If there is an error, reject the promise and stop
        if (err) {
          reject(err);
          return;
        }

        // Otherwise we have a valid rendered template, so create our div and return it
        var element = document.createElement('div');
        element.innerHTML = output;

        if (element.children.length > 1) {
          reject('Rendered template must have a single parent element');
          return;
        } else if (element.children.length === 0) {
          reject('Rendered template is empty');
          return;
        }

        resolve(element.children[0]);
      });
    });
  }

  async renderCard(card) {
    var cardElement = await this.renderTemplate(cardTemplate, card);
    element.setAttribute('class', 'card');

    return element;
  }

  lock() {
    this.locked = true;

    // Remove the game root element from the DOM so the browser doesn't re-render a billion times
    var gameRootElement = this.gameRootElement;
    if (gameRootElement) {
      gameRootElement.parentElement.removeChild(gameRootElement);

      // Remove all children
      while (gameRootElement.firstChild)
        gameRootElement.removeChild(gameRootElement.firstChild);
    }
  }

  unlock() {
    // Now that we are done we will add the root element back, causing the browser to only render once
    if (this.gameRootElement)
      this.rootElement.appendChild(this.gameRootElement);

    this.locked = false;
  }

  async render(cb) {
    if (typeof cb !== 'function')
      return;

    this.lock();

    try {
      var content = await cb.call(this);
      this.gameRootElement.appendChild(content);
    } catch(e) {
      console.error('Error while rendering: ', e);
    }

    this.unlock();
  }
}

module.exports = {
  DOMRenderer
};
