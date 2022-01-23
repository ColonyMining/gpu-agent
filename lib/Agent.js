const { Gpu } = require("./GpuFacade");
const TemperatureAnalyzer = require("./TemperatureAnalyzer");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

const Agent = {
  start: function (params) {
    const interval = (parseInt(params.interval) || DEFAULT_INTERVAL) * 1_000;
    const temperature = parseInt(params.temperature) || DEFAULT_TEMPERATURE;

    const gpus = Gpu.list();

    const temperatureAnalyzer = new TemperatureAnalyzer();

    setInterval(() => {
      Gpu.details(gpus, ["overclock"]);

      temperatureAnalyzer.analyze(gpus, temperature);
    }, interval);
  }
};

module.exports = Agent;
