const NvidiaErrorHandler = {
  handle: function (output) {
    const out = output.toLowerCase();
    if (out.indexOf("connection refused") > -1) {
      throw new Error("Cannot connect to X server");
    }
  }
};

module.exports = NvidiaErrorHandler;
