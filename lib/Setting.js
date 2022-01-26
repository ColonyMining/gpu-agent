const { Gpu, filterGpus } = require("./Gpu");
const { Config } = require("./Config");
const { displayOverclock, copyright } = require("./DisplayTable");

function resetOverclock(selectedGpus = "all", verbose, display) {
  const gpus = Gpu.list(display);
  const overclock = Gpu.overclock(display);
  filterGpus(gpus, selectedGpus).forEach(gpu => overclock.reset(gpu));
  overclock.apply(verbose);
}

function setOverclock(selectedGpus = "all", options, verbose, display) {
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

  Config.define(
    filterSelectedGpus.map(gpu => gpu.index),
    options
  );
}

function getOverclockSettings(selectedGpus = "all", display) {
  const config = Config.load();

  const gpus = Gpu.list(display);
  Gpu.details(gpus);

  const settings = gpus.map(gpu => {
    const gpuConfig = config.gpus[gpu.index] || {};

    const overclockSettings = {
      index: gpu.index,
      name: gpu.name,
      profile: gpuConfig.profile,
      settings: [
        {
          param: "Power",
          current: gpu.power.limit,
          config: gpuConfig.power
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
          current: gpu.overclock.graphics,
          config: gpuConfig.lgc
        },
        {
          param: "LMC",
          current: gpu.overclock.sm,
          config: gpuConfig.lmc
        }
      ]
    };

    overclockSettings.settings.forEach(setting => {
      if (setting.current !== setting.config) {
        setting.current = `${setting.current}`.red;
      }
    });

    return overclockSettings;
  });

  console.log(displayOverclock(settings));
  console.log(copyright());
}

const Setting = {
  setOverclock,
  resetOverclock,
  getOverclockSettings
};

module.exports = Setting;
