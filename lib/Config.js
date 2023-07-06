const fs = require("fs");
const os = require("os");

const COLONY_MINING_FOLDER = `${os.homedir()}/.colonymining`;
const CONFIG_FOLDER = `${COLONY_MINING_FOLDER}/gpu-agent`;
const CONFIG_PATH = `${CONFIG_FOLDER}/config.json`;

class Config {
  constructor() {
    this.config = load();
  }

  get() {
    return this.config;
  }

  gpu(gpuIndex) {
    return this.config.gpus[`${gpuIndex}`];
  }

  gpus() {
    return Object.keys(this.config.gpus).map(key => this.config.gpus[key]);
  }

  profiles() {
    return Object.keys(this.config.profiles).map(profileName =>
      Object.assign(this.config.profiles[profileName], { name: profileName })
    );
  }

  profile(name) {
    const profile = this.config.profiles[name] || {};
    this.config.profiles[name] = profile;
    return {
      get: function () {
        return profile;
      },

      exists: function () {
        return this.config.profiles[name] !== undefined;
      },

      gpu: function (gpuName, tag) {
        const reference = tag ? `:${tag}` : "";
        return profile[`${gpuName}${reference}`] || profile[`${gpuName}`];
      },

      gpus: function () {
        return Object.keys(profile).map(gpuName => profile[gpuName]);
      },

      set: function (gpuName, tag, settings) {
        const reference = tag ? `:${tag}` : "";
        profile[`${gpuName}${reference}`] = settings;

        if (profile[gpuName] === undefined) {
          profile[gpuName] = settings;
        }
      },

      removeGpu: function (gpuName, tag) {
        const reference = tag ? `:${tag}` : "";
        delete profile[`${gpuName}${reference}`];

        Object.keys(this.config.gpus)
          .map(gpuIndex => this.config.gpus[gpuIndex])
          .filter(gpu => gpu.name === gpuName)
          .filter(gpu => tag === undefined || gpu.tag === tag)
          .forEach(gpu => {
            gpu.profile = undefined;
          });
      },

      remove: function () {
        delete this.config.profiles[name];

        Object.keys(this.config.gpus)
          .map(gpuIndex => this.config.gpus[gpuIndex])
          .filter(gpu => gpu.profile === name)
          .forEach(gpu => {
            gpu.profile = undefined;
          });
      }
    };
  }

  removeAllProfiles() {
    thsi.config.profiles = {};

    Object.keys(this.config.gpus)
      .map(gpuIndex => this.config.gpus[gpuIndex])
      .forEach(gpu => {
        gpu.profile = undefined;
      });
  }

  set(gpus, settings) {
    gpus.forEach(gpu => {
      const gpuConfig = this.gpu(gpu.index) || { name: gpu.name };
      Object.keys(settings).forEach(key => {
        if (settings[key] !== undefined) {
          gpuConfig[key] = settings[key];
        }
      });
      gpuConfig.profile = undefined;
      if (gpuConfig.name !== gpu.name) {
        gpuConfig.name = gpu.name;
      }
      if (gpuConfig.tag === "") {
        gpuConfig.tag = undefined;
      }

      this.config.gpus[`${gpu.index}`] = gpuConfig;
    });
  }

  setGpu(gpuIndex, settings) {
    this.config.gpus[`${gpuIndex}`] = settings;
  }

  reset(selectedGpus) {
    selectedGpus.forEach(gpuIndex => {
      const existingConfig = this.gpu(gpuIndex) || {};
      this.config.gpus[`${gpuIndex}`] = { name: existingConfig.name };
      if (existingConfig.tag) {
        this.config.gpus[`${gpuIndex}`].tag = existingConfig.tag;
      }
    });
  }

  save() {
    createFolderIfNotExists();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
  }

  static getFolder() {
    return CONFIG_FOLDER;
  }

  static createFolderIfNotExists() {
    if (!fs.existsSync(COLONY_MINING_FOLDER)) {
      fs.mkdirSync(COLONY_MINING_FOLDER);
    }
    if (!fs.existsSync(CONFIG_FOLDER)) {
      fs.mkdirSync(CONFIG_FOLDER);
    }
  }
}

function load() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      profiles: {},
      gpus: {}
    };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

module.exports = Config;
