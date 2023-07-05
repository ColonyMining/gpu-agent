class Observer {
  constructor(consumer) {
    this.consumer = consumer;
  }

  update() {
    this.consumer();
  }
}

class Observable {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return {
      unsubscribe: () => {
        listeners.delete(listener);
      }
    };
  }

  update(eventType, value) {
    this.listeners.forEach(listener => listener.update(eventType, value));
  }
}

module.exports = { Observer, Observable };
