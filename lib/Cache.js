const fs = require("fs");
const Config = require("./Config");

const CACHE_FILE_PATH = `${Config.getFolder()}/.cache`;

class Cache {
  constructor() {
    this.cachedGpus = undefined;
  }

  getGpus() {
    if (this.cachedGpus) return this.cachedGpus;

    const cacheDir = getCacheDirectory();

    try {
      this.cachedGpus = JSON.parse(fs.readFileSync(`${cacheDir}/gpus.json`).toString());
      return cachedGpus;
    } catch (e) {
      return undefined;
    }
  }

  setGpus(gpus) {
    const cacheDir = getCacheDirectory();
    fs.writeFileSync(`${cacheDir}/gpus.json`, JSON.stringify(gpus));
    this.cachedGpus = gpus;
  }
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

  Config.createFolderIfNotExists();

  cacheFolderPath = fs.mkdtempSync("/tmp/gpu-agent-");
  fs.writeFileSync(CACHE_FILE_PATH, cacheFolderPath);
  return cacheFolderPath;
}

module.exports = Cache;
