const { Gpu } = require("./Gpu");
const TemperatureAnalyzer = require("./TemperatureAnalyzer");
const Report = require("./Report");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

const Agent = {
  start: function (params) {
    const interval = (parseInt(params.interval) || DEFAULT_INTERVAL) * 1_000;
    const temperature = parseInt(params.temperature) || DEFAULT_TEMPERATURE;

    Report.print(undefined, { clear: true, title: "Monitoring GPUs...\n".bold.cyan });

    const gpus = Gpu.list(params.display);

    const temperatureAnalyzer = new TemperatureAnalyzer();

    setInterval(() => {
      Gpu.details(gpus, ["overclock"], params.display);

      temperatureAnalyzer.analyze(gpus, temperature, params.display);
    }, interval);
  }
};

module.exports = Agent;
