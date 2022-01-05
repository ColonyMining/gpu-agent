const { listGpus, readPowerTemperature, readFanSpeed } = require("../lib/Gpu");
const { analyzeTemperature } = require("../lib/TemperatureAnalyzer");

const DEFAULT_INTERVAL = 60_000;
const interval = DEFAULT_INTERVAL;

const DEFAULT_TEMPERATURE = 65;
const temperature = DEFAULT_TEMPERATURE;

const gpus = listGpus();

setInterval(() => {
  readPowerTemperature(gpus);
  readFanSpeed(gpus);

  analyzeTemperature(gpus, temperature);
}, interval);
