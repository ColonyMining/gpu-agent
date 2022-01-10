const fs = require("fs");
const os = require("os");
const { listGpus, readPowerTemperatureClock, readFanSpeed, readOverclock } = require("../lib/Gpu");

function gpuToConfig(gpu) {
  const config = { ...gpu };

  delete config.temperature;
  delete config.deltaTemperature;
  delete config.power.usage;

  return config;
}

const Config = {
  save: function (selectedGpus) {
    const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",");
    const gpus = listGpus().filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(`${gpu.index}`) > -1);

    readPowerTemperatureClock(gpus);
    readFanSpeed(gpus);
    readOverclock(gpus);

    const gpuConfig = {};

    gpus.map(gpuToConfig).forEach(gpu => {
      gpuConfig[gpu.index] = gpu;
    });

    console.log(`Write config file to ${os.homedir()}/.colonymining/gpu-agent/config.json`);
    fs.writeFileSync(`${os.homedir()}/.colonymining/gpu-agent/config.json`, JSON.stringify({ gpus: gpuConfig }));
  }
};

module.exports = { Config, gpuToConfig };
