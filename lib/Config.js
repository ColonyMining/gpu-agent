const fs = require("fs");
const os = require("os");

const COLONY_MINING_FOLDER = `${os.homedir()}/.colonymining`;
const CONFIG_FOLDER = `${COLONY_MINING_FOLDER}/gpu-agent`;
const CONFIG_PATH = `${CONFIG_FOLDER}/config.json`;

function Config() {
  const config = load();

  return {
    get: function () {
      return config;
    },

    gpu: function (gpuIndex) {
      return config.gpus[`${gpuIndex}`];
    },

    gpus: function () {
      return Object.keys(config.gpus).map(key => config.gpus[key]);
    },

    profiles: function () {
      return Object.keys(config.profiles).map(profileName =>
        Object.assign(config.profiles[profileName], { name: profileName })
      );
    },

    profile: function (name) {
      const profile = config.profiles[name] || {};
      config.profiles[name] = profile;
      return {
        get: function () {
          return profile;
        },

        exists: function () {
          return config.profiles[name] !== undefined;
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

          Object.keys(config.gpus)
            .map(gpuIndex => config.gpus[gpuIndex])
            .filter(gpu => gpu.name === gpuName)
            .filter(gpu => tag === undefined || gpu.tag === tag)
            .forEach(gpu => {
              gpu.profile = undefined;
            });
        },

        remove: function () {
          delete config.profiles[name];

          Object.keys(config.gpus)
            .map(gpuIndex => config.gpus[gpuIndex])
            .filter(gpu => gpu.profile === name)
            .forEach(gpu => {
              gpu.profile = undefined;
            });
        }
      };
    },

    removeAllProfiles: function () {
      config.profiles = {};

      Object.keys(config.gpus)
        .map(gpuIndex => config.gpus[gpuIndex])
        .forEach(gpu => {
          gpu.profile = undefined;
        });
    },

    set: function (gpus, settings) {
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

        config.gpus[`${gpu.index}`] = gpuConfig;
      });
    },

    setGpu(gpuIndex, settings) {
      config.gpus[`${gpuIndex}`] = settings;
    },

    reset: function (selectedGpus) {
      selectedGpus.forEach(gpuIndex => {
        const existingConfig = this.gpu(gpuIndex) || {};
        config.gpus[`${gpuIndex}`] = { name: existingConfig.name };
        if (existingConfig.tag) {
          config.gpus[`${gpuIndex}`].tag = existingConfig.tag;
        }
      });
    },

    save: function () {
      createFolderIfNotExists();
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
    }
  };
}

function load() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      profiles: {}
    };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function getFolder() {
  return CONFIG_FOLDER;
}

function createFolderIfNotExists() {
  if (!fs.existsSync(COLONY_MINING_FOLDER)) {
    fs.mkdirSync(COLONY_MINING_FOLDER);
  }
  if (!fs.existsSync(CONFIG_FOLDER)) {
    fs.mkdirSync(CONFIG_FOLDER);
  }
}

Config.getFolder = getFolder;
Config.createFolderIfNotExists = createFolderIfNotExists;

module.exports = Config;
