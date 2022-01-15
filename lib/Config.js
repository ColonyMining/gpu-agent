const fs = require("fs");
const os = require("os");
const { listGpus, readPowerTemperatureClock, readFanSpeed, readOverclock } = require("../lib/Gpu");
const { GpuOverclock } = require("./Gpu");

function gpuToConfig(gpu) {
  const config = { ...gpu };

  delete config.temperature;
  delete config.deltaTemperature;
  delete config.power.usage;

  return config;
}

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

  save: function (selectedGpus, profileName, ref, hashrate) {
    try {
      const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
      const gpus = listGpus();

      readPowerTemperatureClock(gpus);
      readFanSpeed(gpus);
      readOverclock(gpus);

      const config = this.load();
      const profiles = config.profiles;

      gpus
        .filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(`${gpu.index}`) > -1)
        .map(gpuToConfig)
        .forEach(gpu => {
          const profile = profiles[profileName] || {};

          const reference = ref ? `:${ref}` : "";

          profile[`${gpu.name}${reference}`] = {
            name: gpu.name,
            power: gpu.power.limit,
            fan: gpu.fans[0].speed,
            core: gpu.overclock.core,
            memory: gpu.overclock.memory,
            lock: gpu.overclock.graphics,
            hashrate: parseInt(hashrate)
          };

          config.profiles[profileName] = profile;
        });

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
    } catch (e) {
      console.error("Error saving config", e);
    }
  },

  apply: function (selectedGpus, profileName, ref, display = ":0") {
    const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);

    const gpus = listGpus();

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

    gpus
      .filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1)
      .forEach(gpu => {
        const gpuProfile = profile[`${gpu.name}${reference}`];
        if (!gpuProfile) {
          console.error(`No config available for ${profileName} -- ${gpu.index} ${gpu.name}`);
          return;
        }

        const overclock = new GpuOverclock(display);
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

        overclock.apply();
      });

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
  }
};

module.exports = { Config, gpuToConfig };
