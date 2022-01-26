const { Gpu } = require("./Gpu");
const TemperatureAnalyzer = require("./TemperatureAnalyzer");
const { copyright } = require("./DisplayTable");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

const Agent = {
  start: function (params) {
    const interval = (parseInt(params.interval) || DEFAULT_INTERVAL) * 1_000;
    const temperature = parseInt(params.temperature) || DEFAULT_TEMPERATURE;

    console.clear();
    console.log("Monitoring GPUs...\n".bold.cyan);
    console.log(copyright());

    const gpus = Gpu.list();

    const temperatureAnalyzer = new TemperatureAnalyzer();

    setInterval(() => {
      Gpu.details(gpus, ["overclock"]);

      temperatureAnalyzer.analyze(gpus, temperature, params.display);
    }, interval);
  }
};

module.exports = Agent;
