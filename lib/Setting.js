const { Gpu } = require("./Gpu");

function resetOverclock(selectedGpus = "all", display) {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
  const gpus = Gpu.list();
  const overclock = Gpu.overclock(display);
  filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu => overclock.reset(gpu));
  overclock.apply();
}

function setOverclock(selectedGpus = "all", options, display) {
  const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
  const gpus = Gpu.list();
  const overclock = Gpu.overclock(display);

  if (options.power) {
    filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu => overclock.power(gpu.index, options.power));
  }
  if (options.core) {
    filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu => overclock.core(gpu.index, options.core));
  }
  if (options.memory) {
    filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu => overclock.memory(gpu.index, options.memory));
  }
  if (options.fan) {
    filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu =>
      gpu.fans.forEach(fan => overclock.fan(gpu.index, fan.index, options.fan))
    );
  }
  if (options.lgc) {
    filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu =>
      overclock.lockGraphicsClock(gpu.index, options.lgc)
    );
  }
  if (options.lmc) {
    filterGpus(gpus, selectedGpus, selectedGpusIndex).forEach(gpu => overclock.lockMemoryClock(gpu.index, options.lmc));
  }

  overclock.apply();
}

function filterGpus(gpus, selectedGpus, selectedGpusIndex) {
  return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);
}

const Setting = {
  setOverclock,
  resetOverclock
};

module.exports = Setting;
