const Config = require("./Config");
const { Gpu, filterGpus } = require("./Gpu");
const { Observable } = require("./Observer");

function Overclock(display) {
  const observable = new Observable();

  return {
    subscribe: function (listener) {
      observable.subscribe(listener);
    },

    current: async function (selectedGpus = "all") {
      const config = new Config();

      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();
      await gpuController.details(gpus);

      return filterGpus(gpus, selectedGpus).map(gpu => {
        const gpuConfig = config.gpu(gpu.index) || {};

        return {
          index: gpu.index,
          name: gpu.name,
          tag: gpuConfig.tag,
          profile: gpuConfig.profile,
          settings: [
            {
              param: "Power",
              current: gpu.power.limit,
              config: gpuConfig.power
            },
            {
              param: "Temperature",
              current: gpu.temperature,
              config: gpuConfig.temperature
            },
            {
              param: "Fan",
              current: gpu.fans.map(fan => fan.speed).reduce((prev, current) => (current > prev ? current : prev), 0),
              config: gpuConfig.fan
            },
            {
              param: "Core",
              current: gpu.overclock.core,
              config: gpuConfig.core
            },
            {
              param: "Memory",
              current: gpu.overclock.memory,
              config: gpuConfig.memory
            },
            {
              param: "LGC",
              current: gpu.overclock.lgc,
              config: gpuConfig.lgc
            },
            {
              param: "LMC",
              current: gpu.overclock.lmc,
              config: gpuConfig.lmc
            }
          ]
        };
      });
    },

    set: async function (selectedGpus, options, verbose) {
      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();
      const overclock = gpuController.overclock();

      const filterSelectedGpus = filterGpus(gpus, selectedGpus);

      if (options.power) {
        filterSelectedGpus.forEach(gpu => overclock.power(gpu.index, options.power));
      }
      if (options.core) {
        filterSelectedGpus.forEach(gpu => overclock.core(gpu.index, options.core));
      }
      if (options.memory) {
        filterSelectedGpus.forEach(gpu => overclock.memory(gpu.index, options.memory));
      }
      if (options.fan) {
        filterSelectedGpus.forEach(gpu => gpu.fans.forEach(fan => overclock.fan(gpu.index, fan.index, options.fan)));
      }
      if (options.lgc) {
        filterSelectedGpus.forEach(gpu => overclock.lockGraphicsClock(gpu.index, options.lgc));
      }
      if (options.lmc) {
        filterSelectedGpus.forEach(gpu => overclock.lockMemoryClock(gpu.index, options.lmc));
      }

      await overclock.apply(verbose);

      if (options.removeTag) {
        options.tag = "";
      }
      delete options.removeTag;

      const config = new Config();
      config.set(filterSelectedGpus, options);
      config.save();
    },

    save: async function (selectedGpus, profileName, hashrate) {
      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();

      const config = new Config();

      filterGpus(gpus, selectedGpus).forEach(gpu => {
        const profile = config.profile(profileName);
        const gpuConfig = config.gpu(gpu.index);
        if (!gpuConfig) {
          observable.update(Overclock.Events.GPU_SETTINGS_NOT_FOUND, { gpu: gpu.index });
          return;
        }

        profile.set(gpu.name, gpuConfig.tag, {
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
        });
      });

      config.save();
    },

    load: async function (selectedGpus, profileName, verbose) {
      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();

      const config = new Config();

      const profile = config.profile(profileName);
      if (!profile.exists()) {
        throw new Error(`Profile not found ${profileName}`);
      }

      await Promise.all(
        filterGpus(gpus, selectedGpus).map(gpu => {
          const currentGpuConfig = config.gpu(gpu.index) || {};

          const gpuProfile = profile.gpu(gpu.name, currentGpuConfig.tag);
          if (!gpuProfile) {
            observable.update(Overclock.Events.GPU_PROFILE_NOT_FOUND, {
              gpu: gpu.index,
              name: gpu.name,
              profile: profileName
            });
            return;
          }

          const overclock = gpuController.overclock();
          overclock.reset(gpu);

          observable.update(Overclock.Events.SET_GPU_PROFILE, { gpu: gpu.index, profile: profileName });

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

          config.setGpu(gpu.index, gpuConfig);
          return overclock.apply(verbose);
        })
      );

      config.save();
    },

    reset: async function (selectedGpus, verbose) {
      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();
      const overclock = gpuController.overclock();
      const filteredGpus = filterGpus(gpus, selectedGpus);
      filteredGpus.forEach(gpu => overclock.reset(gpu));
      await overclock.apply(verbose);

      const config = new Config();
      config.reset(filteredGpus.map(gpu => gpu.index));
      config.save();
    }
  };
}

Overclock.Events = {
  GPU_SETTINGS_NOT_FOUND: "GPU_SETTINGS_NOT_FOUND",
  GPU_PROFILE_NOT_FOUND: "GPU_PROFILE_NOT_FOUND",
  SET_GPU_PROFILE: "SET_GPU_PROFILE"
};

module.exports = Overclock;
