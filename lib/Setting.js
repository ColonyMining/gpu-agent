const { Gpu, filterGpus } = require("./Gpu");
const Config = require("./Config");
const { displayOverclock } = require("./DisplayTable");
const Report = require("./Report");

function Setting(display) {
  return {
    setOverclock: function (selectedGpus = "all", options, verbose) {
      const gpus = Gpu.list(display);
      const overclock = Gpu.overclock(display);

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

      overclock.apply(verbose);

      new Config(display).define(
        filterSelectedGpus.map(gpu => gpu.index),
        options
      );
    },

    resetOverclock: function (selectedGpus = "all", verbose) {
      const gpus = Gpu.list(display);
      const overclock = Gpu.overclock(display);
      filterGpus(gpus, selectedGpus).forEach(gpu => overclock.reset(gpu));
      overclock.apply(verbose);
    },

    getOverclockSettings: function (selectedGpus = "all") {
      const config = new Config(display).load();

      const gpus = Gpu.list(display);
      Gpu.details(gpus, [], display);

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
