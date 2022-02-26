const fs = require("fs");

const COLONY_MINING_LOG_FOLDER = "/var/log/colonymining";
const GPU_AGENT_LOG_FOLDER = `${COLONY_MINING_LOG_FOLDER}/gpu-agent`;
const LOG_FILE_PATH = `${GPU_AGENT_LOG_FOLDER}/change.log`;

function log(text) {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    createFolder();
  }

  fs.appendFile(LOG_FILE_PATH, `${text}\n`, function (err) {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}

function createFolder() {
  if (!fs.existsSync(COLONY_MINING_LOG_FOLDER)) {
    fs.mkdirSync(COLONY_MINING_LOG_FOLDER);
  }
  if (!fs.existsSync(GPU_AGENT_LOG_FOLDER)) {
    fs.mkdirSync(GPU_AGENT_LOG_FOLDER);
  }
}

module.exports = { log };
