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

  if (options.power) {
    filterGpus(gpus, selectedGpus).forEach(gpu => overclock.power(gpu.index, options.power));
  }
  if (options.core) {
    filterGpus(gpus, selectedGpus).forEach(gpu => overclock.core(gpu.index, options.core));
  }
  if (options.memory) {
    filterGpus(gpus, selectedGpus).forEach(gpu => overclock.memory(gpu.index, options.memory));
  }
  if (options.fan) {
    filterGpus(gpus, selectedGpus).forEach(gpu =>
      gpu.fans.forEach(fan => overclock.fan(gpu.index, fan.index, options.fan))
    );
  }
  if (options.lgc) {
    filterGpus(gpus, selectedGpus).forEach(gpu => overclock.lockGraphicsClock(gpu.index, options.lgc));
  }
  if (options.lmc) {
    filterGpus(gpus, selectedGpus).forEach(gpu => overclock.lockMemoryClock(gpu.index, options.lmc));
  }

  overclock.apply(verbose);

  Config.define(selectedGpus, options);
}

function getOverclockSettings(selectedGpus = "all", display) {
  const config = Config.load();

  const gpus = Gpu.list(display);
  Gpu.details(gpus);

  const settings = gpus.map(gpu => {
    const gpuConfig = config.gpus[gpu.index] || {};

    return {
      index: gpu.index,
      name: gpu.name,
      power: {
        current: gpu.power.limit,
        config: gpuConfig.power
      },
      fan: {
        current: gpu.fans.map(fan => fan.speed).reduce((prev, current) => (current > prev ? current : prev), 0),
        config: gpuConfig.fan
      },
      core: {
        current: gpu.overclock.core,
        config: gpuConfig.core
      },
      memory: {
        current: gpu.overclock.memory,
        config: gpuConfig.memory
      },
      lgc: {
        current: gpu.overclock.graphics,
        config: gpuConfig.lgc
      },
      lmc: {
        current: gpu.overclock.sm,
        config: gpuConfig.lmc
      }
    };
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
