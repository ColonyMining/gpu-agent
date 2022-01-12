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
  save: function (selectedGpus, override) {
    try {
      const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",");
      const gpus = listGpus();

      readPowerTemperatureClock(gpus);
      readFanSpeed(gpus);
      readOverclock(gpus);

      const gpuConfig = {};

      gpus
        .filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(`${gpu.index}`) > -1)
        .map(gpuToConfig)
        .forEach(gpu => {
          gpuConfig[gpu.index] = gpu;
        });

      const path = `${os.homedir()}/.colonymining/gpu-agent/config.json`;
      console.log(`Write config file to ${path}`);

      if (override) {
        fs.writeFileSync(path, JSON.stringify({ gpus: gpuConfig }));
      } else {
        const existingConfig = JSON.parse(fs.readFileSync(path, "utf8"));
        existingConfig.gpus = Object.assign(existingConfig.gpus, gpuConfig);
        fs.writeFileSync(path, JSON.stringify(existingConfig));
      }
    } catch (e) {
      console.log("Error saving config", e);
    }
  }
};

module.exports = { Config, gpuToConfig };
