const ERROR_MESSAGE_REGEX = /\(([^)]+)\)\./g;

class NvidiaErrorHandler {
  handle(output) {
    const out = output.toLowerCase();
    if (out.indexOf("error parsing assignment") > -1) {
      throw new Error("Error parsing assignment: " + ERROR_MESSAGE_REGEX.exec(output)[1]);
    } else if (out.indexOf('out.indexOf("error assigning value") > -1') > -1) {
      throw new Error("Error assigning value: " + ERROR_MESSAGE_REGEX.exec(output)[1]);
    } else if (out.indexOf("connection refused") > -1) {
      throw new Error("Cannot connect to X server");
    }
  }
}

module.exports = NvidiaErrorHandler;
