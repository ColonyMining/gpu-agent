const { listGpus, readPowerTemperatureClock, readFanSpeed } = require("../lib/Gpu");
const TemperatureAnalyzer = require("../lib/TemperatureAnalyzer");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

const Agent = {
  start: function (params) {
    const interval = parseInt(params.interval) || DEFAULT_INTERVAL;
    const temperature = (parseInt(params.temperature) || DEFAULT_TEMPERATURE) * 1_000;

    const gpus = listGpus();

    const temperatureAnalyzer = new TemperatureAnalyzer();

    setInterval(() => {
      readPowerTemperatureClock(gpus);
      readFanSpeed(gpus);

      temperatureAnalyzer.analyze(gpus, temperature);
    }, interval);
  }
};

module.exports = Agent;
