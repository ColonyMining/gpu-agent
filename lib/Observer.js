class Observer {
  constructor(consumer) {
    this.consumer = consumer;
  }

  update(eventType, value) {
    this.consumer(eventType, value);
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
        this.listeners.delete(listener);
      }
    };
  }

  update(eventType, value) {
    this.listeners.forEach(listener => listener.update(eventType, value));
  }
}

module.exports = { Observer, Observable };
