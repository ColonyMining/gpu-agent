const { Gpu } = require("./Gpu");
const TemperatureAnalyzer = require("./TemperatureAnalyzer");
const Report = require("./Report");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

const Agent = {
  start: async function (interval, temperature, display) {
    const defaultInterval = (parseInt(interval) || DEFAULT_INTERVAL) * 1_000;
    if (defaultInterval < 30_000) {
      console.error("the interval cannot be less than 30s".red);
      return;
    }

    const defaultTemperature = parseInt(temperature) || DEFAULT_TEMPERATURE;

    Report.print(undefined, { clear: true, title: "Monitoring GPUs...\n".bold.cyan });

    const gpuController = new Gpu(display);
    const gpus = await gpuController.list(display);

    const temperatureAnalyzer = new TemperatureAnalyzer(defaultTemperature, display);

    setInterval(async () => {
      await gpuController.details(gpus, ["overclock"]);

      await temperatureAnalyzer.analyze(gpus);
    }, defaultInterval);
  }
};

module.exports = Agent;
