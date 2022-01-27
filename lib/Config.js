const fs = require("fs");
const os = require("os");
const { Gpu, filterGpus } = require("./Gpu");

const CONFIG_PATH = `${os.homedir()}/.colonymining/gpu-agent/config.json`;

function Config(display = ":0") {
  return {
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
        Object.keys(settings).forEach(key => {
          if (settings[key] !== undefined) {
            gpu[key] = settings[key];
          }
        });
        gpu.profile = undefined;
        if (gpu.tag === "") {
          gpu.tag = undefined;
        }

        config.gpus[`${gpuIndex}`] = gpu;
      });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
    },

    reset: function (selectedGpus) {
      const config = this.load();
      selectedGpus.forEach(gpuIndex => {
        const existingConfig = config.gpus[`${gpuIndex}`];
        config.gpus[`${gpuIndex}`] = {};
        if (existingConfig.tag) {
          config.gpus[`${gpuIndex}`].tag = existingConfig.tag;
        }
      });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
    },

    save: function (selectedGpus, profileName, hashrate) {
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

          const reference = gpuConfig.tag ? `:${gpuConfig.tag}` : "";

          profile[`${gpu.name}${reference}`] = {
            name: gpu.name,
            tag: gpuConfig.tag,
            temperature: gpuConfig.temperature,
            power: gpuConfig.power,
            fan: gpuConfig.fan,
            core: gpuConfig.core,
            memory: gpuConfig.memory,
            lgc: gpuConfig.lgc,
            lmc: gpuConfig.lmc,
            hashrate: hashrate
          };

          config.profiles[profileName] = profile;

          gpuConfig.profile = profileName;
        });

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
      } catch (e) {
        console.error("Error saving config", e);
      }
    },

    apply: function (selectedGpus, profileName, verbose) {
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

      filterGpus(gpus, selectedGpus).forEach(gpu => {
        const currentGpuConfig = config.gpus[`${gpu.index}`] || {};

        const reference = currentGpuConfig.tag ? `:${currentGpuConfig.tag}` : "";

        const gpuProfile = profile[`${gpu.name}${reference}`] || profile[gpu.name];
        if (!gpuProfile) {
          console.error(`No config available for ${profileName} -- ${gpu.index} ${gpu.name}`);
          return;
        }

        const overclock = new Gpu.overclock(display);
        overclock.reset(gpu);
        overclock.apply();

        console.log(`GPU ${gpu.index} set to profile ${profileName}`.yellow);

        const gpuConfig = {};
        gpuConfig.profile = profileName;
        if (currentGpuConfig.tag && currentGpuConfig.tag !== "") {
          gpuConfig.tag = currentGpuConfig.tag;
        }
        config.gpus[gpu.index] = gpuConfig;

        if (gpuProfile.fan) {
          gpu.fans.forEach(fan => overclock.fan(gpu.index, fan.index, gpuProfile.fan));
          gpuConfig.fan = gpuProfile.fan;
        }
        if (gpuProfile.temperature) {
          gpuConfig.temperature = gpuProfile.temperature;
        }
        if (gpuProfile.power) {
          overclock.power(gpu.index, gpuProfile.power);
          gpuConfig.power = gpuProfile.power;
        }
        if (gpuProfile.core) {
          overclock.core(gpu.index, gpuProfile.core);
          gpuConfig.core = gpuProfile.core;
        }
        if (gpuProfile.memory) {
          overclock.memory(gpu.index, gpuProfile.memory);
          gpuConfig.memory = gpuProfile.memory;
        }
        if (gpuProfile.lgc) {
          overclock.lockGraphicsClock(gpu.index, gpuProfile.lgc);
          gpuConfig.lgc = gpuProfile.lgc;
        }
        if (gpuProfile.lmc) {
          overclock.lockMemoryClock(gpu.index, gpuProfile.lmc);
          gpuConfig.lmc = gpuProfile.lmc;
        }

        overclock.apply(verbose);

        config.gpus[`${gpu.index}`] = gpuConfig;
      });

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
    }
  };
}

module.exports = Config;
