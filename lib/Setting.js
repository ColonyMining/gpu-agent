const { Gpu, filterGpus } = require("./Gpu");
const Config = require("./Config");
const { displayOverclock } = require("./DisplayTable");
const Report = require("./Report");

function Setting(display) {
  return {
    setOverclock: async function (selectedGpus = "all", options, verbose) {
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

      new Config(display).define(
        filterSelectedGpus.map(gpu => gpu.index),
        options
      );
    },

    resetOverclock: async function (selectedGpus = "all", verbose) {
      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();
      const overclock = gpuController.overclock();
      const filteredGpus = filterGpus(gpus, selectedGpus);
      filteredGpus.forEach(gpu => overclock.reset(gpu));
      await overclock.apply(verbose);
      new Config(display).reset(filteredGpus.map(gpu => gpu.index));
    },

    getOverclockSettings: async function (selectedGpus = "all") {
      const config = new Config(display).load();

      const gpuController = new Gpu(display);
      const gpus = await gpuController.list();
      await gpuController.details(gpus);

      const settings = filterGpus(gpus, selectedGpus).map(gpu => {
        const gpuConfig = config.gpus[gpu.index] || {};

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

      Report.print(displayOverclock(settings));
    }
  };
}

module.exports = Setting;
