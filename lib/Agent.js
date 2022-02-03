const TemperatureAnalyzer = require("./TemperatureAnalyzer");
const { Gpu } = require("./Gpu");
const { seconds, every } = require("./Timer");
const { Observable, Observer } = require("./Observer");
const { log } = require("./Logger");

const DEFAULT_INTERVAL = 60;
const DEFAULT_TEMPERATURE = 65;

function Agent(interval = DEFAULT_INTERVAL, temperature = DEFAULT_TEMPERATURE, display) {
  if (interval < 30) {
    throw new Error("the interval cannot be less than 30s");
  }

  const observable = new Observable();

  return {
    subscribe: function (listener) {
      observable.subscribe(listener);
    },

    start: async function () {
      observable.update(Agent.Events.START);

      const gpuController = new Gpu(display);
      const gpus = await gpuController.list(display);

      const temperatureAnalyzer = new TemperatureAnalyzer(temperature, display);
      temperatureAnalyzer.subscribe(new Observer(changelog));
      temperatureAnalyzer.subscribe(
        new Observer((eventType, gpuChangelog) => observable.update(Agent.Events.UPDATE, gpuChangelog))
      );

      every(seconds(interval).toMillis()).call(async () => {
        await gpuController.details(gpus, ["overclock"]);
        await temperatureAnalyzer.analyze(gpus);
      });
    }
  };
}

function changelog(eventType, gpuChangelog) {
  gpuChangelog.forEach(gpuChange => {
    gpuChange.fans.forEach(fan => {
      log(
        [
          gpuChange.timestamp,
          gpuChange.name,
          gpuChange.index,
          gpuChange.power.usage,
          gpuChange.temperature,
          gpuChange.deltaTemperature,
          fan.index,
          fan.speed
        ].join(";")
      );
    });
  });
}

Agent.Events = {
  START: "START",
  UPDATE: "UPDATE"
};

module.exports = Agent;
