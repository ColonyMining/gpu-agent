const fs = require("fs");

const LOG_FILE_PATH = "/var/log/colonymining/gpu-agent/change.log";

function log(text) {
  fs.appendFile(LOG_FILE_PATH, `${text}\n`, function (err) {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}

module.exports = { log };
