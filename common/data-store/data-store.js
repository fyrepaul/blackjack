const {
        applyMiddleware,
        buildStore,
        createReducer,
        _actionNameAlias
      } = require('redux-panoptic'),
      players = require('./players'),
      cards = require('./cards'),
      game = require('./game'),
      permissions = require('./permissions'),
      { noop, attrGetterSetter } = require('../utils');

// Define our template for our store
const dataStoreTemplate = {
  template: Object.assign({}, players.template, cards.template, game.template, permissions.template),
  selectors: Object.assign({}, players.selectors, cards.selectors, game.selectors, permissions.selectors)
};

class DataStore {
  constructor(_game, _opts) {
    // Create some middleware to help us log dispatches
    var game = _game,
        opts = _opts || {},
        dispatchActionMiddleware = (store) => (next) => (action) => {
          console.log('Dispatching action [' + action.type + ']: ' + JSON.stringify(action.payload));
          return next(action);
        };

    if (!game)
      throw new Error('"game" argument required for DataStore constructor');

    var store = (opts.debug) ? buildStore(dataStoreTemplate.template, applyMiddleware(dispatchActionMiddleware)) : buildStore(dataStoreTemplate.template),
        dispatch = store.dispatch.bind(store),
        subscribers = [],
        oldState = store.getState(),
        updateTimer;

    attrGetterSetter(this, 'multiDispatch', () => store.multiDispatch, noop);
    attrGetterSetter(this, 'multiDispatchReset', () => store.multiDispatchReset, noop);
    attrGetterSetter(this, 'multiDispatchSet', () => store.multiDispatchSet, noop);
    attrGetterSetter(this, 'multiDispatchUpdate', () => store.multiDispatchUpdate, noop);
    attrGetterSetter(this, '_subscribers', () => subscribers, noop);
    attrGetterSetter(this, 'dispatch', () => dispatch, noop);
    attrGetterSetter(this, 'actions', () => store.actions, noop);
    attrGetterSetter(this, 'selectors', () => dataStoreTemplate.selectors, noop);
    attrGetterSetter(this, 'state', () => {
      var state = store.getState();
      attrGetterSetter(state, '_game', () => game, noop);
      return state;
    }, noop);

    var _disconnectStoreListener = store.subscribe(() => {
      if (updateTimer)
        clearTimeout(updateTimer);

      updateTimer = setTimeout(() => {
        updateTimer = null;

        var state = store.getState();
        for (var i = 0; i < subscribers.length; i++) {
          var subscriber = subscribers[i];
          subscriber.callback.call(this, state, oldState, this);
        }

        oldState = state;
      }, 1);
    });

    attrGetterSetter(this, 'stopListening', () => {
      subscribers = [];
      _disconnectStoreListener();
    }, noop);
  }

  destroy() {
    if (typeof this.stopListening === 'function')
      this.stopListening();
  }

  op(func, nextTick) {
    const doCall = func.bind(this, {
      state: this.state,
      selectors: this.selectors,
      dispatch: this.dispatch,
      actions: this.actions
    });

    return (nextTick) ? global.nextTick(doCall) : doCall();
  }

  subscribe(func) {
    if (typeof func !== 'function')
      throw new Error('Subscribe argument must be a function');

    var subscribers = this._subscribers,
        subscriber = {
          callback: func
        };

    subscribers.push(subscriber);

    return function() {
      var index = subscribers.indexOf(subscriber);
      if (index >= 0)
        subscribers.splice(index, 1);
    };
  }
}

module.exports = {
  DataStore
};
