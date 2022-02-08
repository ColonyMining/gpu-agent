const fs = require("fs");
const os = require("os");

const CACHE_FILE_PATH = `${os.homedir()}/.colonymining/gpu-agent/.cache`;

function Cache() {
  let cachedGpus;

  return {
    getGpus: function () {
      if (cachedGpus) return cachedGpus;

      const cacheDir = getCacheDirectory();

      try {
        cachedGpus = JSON.parse(fs.readFileSync(`${cacheDir}/gpus.json`).toString());
        return cachedGpus;
      } catch (e) {
        return undefined;
      }
    },

    setGpus: function (gpus) {
      const cacheDir = getCacheDirectory();
      fs.writeFileSync(`${cacheDir}/gpus.json`, JSON.stringify(gpus));
      cachedGpus = gpus;
    }
  };
}

function getCacheDirectory() {
  let cacheFolderPath;

  if (fs.existsSync(CACHE_FILE_PATH)) {
    cacheFolderPath = fs.readFileSync(CACHE_FILE_PATH).toString();
  }

  if (cacheFolderPath) {
    if (fs.existsSync(cacheFolderPath)) {
      return cacheFolderPath;
    }
  }

  cacheFolderPath = fs.mkdtempSync("/tmp/gpu-agent-");
  fs.writeFileSync(CACHE_FILE_PATH, cacheFolderPath);
  return cacheFolderPath;
}

module.exports = Cache;
