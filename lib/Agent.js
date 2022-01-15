const { listGpus, readPowerTemperatureClock, readFanSpeed, readOverclock } = require("./Gpu");
const TemperatureAnalyzer = require("./TemperatureAnalyzer");
const { gpuToConfig } = require("./Config");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

const Agent = {
  start: function (params) {
    const interval = (parseInt(params.interval) || DEFAULT_INTERVAL) * 1_000;
    const temperature = parseInt(params.temperature) || DEFAULT_TEMPERATURE;

    const gpus = listGpus();

    const temperatureAnalyzer = new TemperatureAnalyzer();

    setInterval(() => {
      readPowerTemperatureClock(gpus);
      readFanSpeed(gpus);

      temperatureAnalyzer.analyze(gpus, temperature);
    }, interval);
  },

  status: function (selectedGpus) {
    const selectedGpusIndex = selectedGpus === "all" ? [] : selectedGpus.split(",").map(parseInt);
    const gpus = listGpus();

    readPowerTemperatureClock(gpus);
    readFanSpeed(gpus);
    readOverclock(gpus);

    return gpus.filter(gpu => selectedGpus === "all" || selectedGpusIndex.indexOf(gpu.index) > -1).map(gpuToConfig);
  }
};

module.exports = Agent;
