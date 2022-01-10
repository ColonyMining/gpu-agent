const fs = require("fs");
const os = require("os");
const { listGpus, readPowerTemperature, readFanSpeed, readOverclock } = require("../lib/Gpu");

function gpuToConfig(gpu) {
  const config = { ...gpu };

  delete config.temperature;
  delete config.deltaTemperature;
  delete config.power.usage;

  return config;
}

const Config = {
  save: function (selectedGpus = "all") {
    const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",");
    const gpus = listGpus().filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1);

    readPowerTemperature(gpus);
    readFanSpeed(gpus);
    readOverclock(gpus);

    const gpuConfig = {};

    gpus.map(gpuToConfig).forEach(gpu => {
      gpuConfig[gpu.index] = gpu;
    });

    fs.writeFileSync(`${os.homedir()}/.colonymining/gpu-agent/config.json`, JSON.stringify({ gpus: gpuConfig }));
  }
};

module.exports = { Config, gpuToConfig };