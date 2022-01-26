const fs = require("fs");
const os = require("os");
const { Gpu, filterGpus } = require("./Gpu");

const CONFIG_PATH = `${os.homedir()}/.colonymining/gpu-agent/config.json`;

const Config = {
  load: function () {
    if (!fs.existsSync(CONFIG_PATH)) {
      return {
        profiles: {}
      };
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  },

  define: function (selectedGpus, settings) {
    const config = this.load();
    selectedGpus.forEach(gpuIndex => {
      const gpu = config.gpus[`${gpuIndex}`] || {};
      Object.assign(gpu, settings);
      gpu.profile = undefined;
      config.gpus[`${gpuIndex}`] = gpu;
    });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
  },

  save: function (selectedGpus, profileName, ref, hashrate, display) {
    try {
      const gpus = Gpu.list(display);

      const config = this.load();
      const profiles = config.profiles;

      filterGpus(gpus, selectedGpus).forEach(gpu => {
        const profile = profiles[profileName] || {};
        const gpuConfig = config.gpus[`${gpu.index}`];
        if (!gpuConfig) {
          console.error(`GPU ${gpu.index} configuration not found`.red);
          return;
        }

        const reference = ref ? `:${ref}` : "";

        profile[`${gpu.name}${reference}`] = {
          name: gpu.name,
          ref: ref,
          power: gpuConfig.power,
          fan: gpuConfig.fan,
          core: gpuConfig.core,
          memory: gpuConfig.memory,
          lgc: gpuConfig.lgc,
          lmc: gpuConfig.lmc
        };

        config.profiles[profileName] = profile;

        gpuConfig.profile = profileName;
      });

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
    } catch (e) {
      console.error("Error saving config", e);
    }
  },

  apply: function (selectedGpus, profileName, ref, verbose, display) {
    const gpus = Gpu.list(display);

    const config = this.load();
    if (!config.gpus) {
      config.gpus = {};
    }

    const profile = config.profiles[profileName];
    if (!profile) {
      console.error(`Profile not found ${profileName}`);
      return;
    }

    const reference = ref ? `:${ref}` : "";

    filterGpus(gpus, selectedGpus).forEach(gpu => {
      const gpuProfile = profile[`${gpu.name}${reference}`];
      if (!gpuProfile) {
        console.error(`No config available for ${profileName} -- ${gpu.index} ${gpu.name}`);
        return;
      }

      const overclock = new Gpu.overclock(display);
      overclock.reset(gpu);
      overclock.apply();

      console.log(`GPU ${gpu.index} set to profile ${profileName}`.yellow);

      const gpuConfig = config.gpus[gpu.index] || {};
      gpuConfig.profile = profileName;
      if (ref && ref !== "") {
        gpuConfig.ref = ref;
      }
      config.gpus[gpu.index] = gpuConfig;

      if (gpuProfile.fan) {
        gpu.fans.forEach(fan => overclock.fan(gpu.index, fan.index, gpuProfile.fan));
      }
      if (gpuProfile.power) {
        overclock.power(gpu.index, gpuProfile.power);
      }
      if (gpuProfile.lock) {
        overclock.lockGraphicsClock(gpu.index, gpuProfile.lock);
      }
      if (gpuProfile.core) {
        overclock.core(gpu.index, gpuProfile.core);
      }
      if (gpuProfile.memory) {
        overclock.memory(gpu.index, gpuProfile.memory);
      }

      overclock.apply(verbose);

      this.define([gpu.index], gpuProfile);
    });

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
  }
};

function gpuToConfig(gpu) {
  const config = { ...gpu };

  delete config.temperature;
  delete config.deltaTemperature;
  delete config.power.usage;

  return config;
}

module.exports = { Config };
