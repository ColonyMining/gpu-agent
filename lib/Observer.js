function Observer(consumer) {
  return {
    update: consumer
  };
}

function Observable() {
  const listeners = new Set();

  return {
    subscribe: function (listener) {
      listeners.add(listener);
      return {
        unsubscribe: () => {
          listeners.delete(listener);
        }
      };
    },

    update: function (eventType, value) {
      listeners.forEach(listener => listener.update(eventType, value));
    }
  };
}

module.exports = { Observer, Observable };
