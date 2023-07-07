function every(ms) {
  return {
    call: function (callback) {
      setInterval(callback, ms);
    }
  };
}

function seconds(time) {
  return {
    toMillis: function () {
      return time * 1_000;
    }
  };
}

module.exports = { every, seconds };
